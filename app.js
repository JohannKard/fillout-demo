const express = require("express");
const axios = require("axios");
const app = express();

// use this formId cLZojxk94ous

const API_KEY =
  "sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912";
const LIMIT_DEFAULT = 150;

app.get("/:formId/filteredResponses", async (req, res) => {
  const formId = req.params.formId;
  const { filters, limit, ...queryParams } = req.query;
  const parsedFilters = filters ? JSON.parse(filters) : [];

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

    const filteredResponses = response.data.responses.filter((submission) => {
      return parsedFilters?.every((filter) => {
        if (submission.questions.findIndex((q) => q.id === filter.id) === -1)
          return false;

        const questionValue = isNaN(question.value)
          ? question.value
          : parseFloat(question.value);
        const filterValue = isNaN(filter.value)
          ? filter.value
          : parseFloat(filter.value);

        switch (filter.condition) {
          case "equals":
            return questionValue === filterValue;
          case "does_not_equal":
            return questionValue !== filterValue;
          case "greater_than":
            return isNaN(questionValue) || isNaN(filterValue)
              ? new Date(questionValue) > new Date(filterValue)
              : questionValue > filterValue;
          case "less_than":
            return isNaN(questionValue) || isNaN(filterValue)
              ? new Date(questionValue) < new Date(filterValue)
              : questionValue < filterValue;
          default:
            return false;
        }
      });
    });

    const pageCount =
      filteredResponses.length > 0
        ? Math.ceil(
            limit
              ? filteredResponses.length / limit
              : filteredResponses.length / LIMIT_DEFAULT
          )
        : 0;

    res.json({
      responses: filteredResponses,
      totalResponses: filteredResponses.length,
      pageCount,
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
