const express = require("express");
const axios = require("axios");
const app = express();

// use this formId cLZojxk94ous

const API_KEY =
  "sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912";
const LIMIT_DEFAULT = 150;

const filterResponses = (responses, filters) => {
  const parsedFilters = filters ? JSON.parse(filters) : [];
  return responses.filter((submission) => {
    return parsedFilters?.every((filter) => {
      const question = submission.questions.find((q) => q.id === filter.id);
      if (!question) return false;
      switch (filter.condition) {
        case "equals":
          return question.value === filter.value.toString();
        case "does_not_equal":
          return question.value !== filter.value.toString();
        case "greater_than":
          return (
            new Date(question.value).getTime() >
            new Date(filter.value).getTime()
          );
        case "less_than":
          return (
            new Date(question.value).getTime() <
            new Date(filter.value).getTime()
          );
        default:
          return false;
      }
    });
  });
};

const getPaginationData = (filteredResponses, limit) => {
  const pageCount =
    filteredResponses.length > 0
      ? Math.ceil(
          limit
            ? filteredResponses.length / limit
            : filteredResponses.length / LIMIT_DEFAULT
        )
      : 0;
  return { totalResponses: filteredResponses.length, pageCount };
};

app.get("/:formId/filteredResponses", async (req, res) => {
  const formId = req.params.formId;
  const { filters, limit, offset, ...queryParams } = req.query;

  try {
    const response = await axios.get(
      `https://api.fillout.com/v1/api/forms/${formId}/submissions`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        params: queryParams,
      }
    );

    const filteredResponses = filterResponses(response.data.responses, filters);
    const paginationData = getPaginationData(filteredResponses, limit);

    res.json({
      responses: filteredResponses.slice(
        offset ? offset : 0,
        limit ? limit : LIMIT_DEFAULT
      ),
      ...paginationData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
