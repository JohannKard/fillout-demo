const express = require("express");
const axios = require("axios");
const app = express();

// use this formId cLZojxk94ous

const API_KEY =
  "sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912";
const LIMIT_DEFAULT = 150;

app.get("/:formId/filteredResponses", async (req, res) => {
  const formId = req.params.formId;
  const { filters, ...queryParams } = req.query;

  console.log(queryParams);

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
      return filters
        ? JSON.parse(filters).every((filter) => {
            const question = submission.questions.find(
              (q) => q.id === filter.id
            );
            if (!question) return false;

            switch (filter.condition) {
              case "equals":
                return question.value === filter.value.toString();
              case "does_not_equal":
                return question.value !== filter.value.toString();
              case "greater_than":
                const questionDate = new Date(questionValue);
                const filterDate = new Date(filterValue);
                return (
                  !isNaN(questionDate) &&
                  !isNaN(filterDate) &&
                  questionDate > filterDate
                );
              case "less_than":
                const questionDateLT = new Date(questionValue);
                const filterDateLT = new Date(filterValue);
                return (
                  !isNaN(questionDateLT) &&
                  !isNaN(filterDateLT) &&
                  questionDateLT < filterDateLT
                );
              default:
                return false;
            }
          })
        : true;
    });

    const pageCount =
      filteredResponses.length > 0
        ? Math.ceil(
            queryParams.limit
              ? filteredResponses.length / queryParams.limit
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
