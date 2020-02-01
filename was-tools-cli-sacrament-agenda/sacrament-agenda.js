const { compile } = require("./template-compiler");
const path = require("path");

function getData() {
  return {
    presiding: "Bishop Mike Sonnenberg",
    conducting: "Aaron Anthony",
    visitingHighCouncilor: false,
    announcements: [],
    hymns: {
      opening: {
        number: 105,
        title: "Master, the Tempest Is Raging"
      },
      sacrament: {
        number: 191,
        title: "Behold the Great Redeemer Die"
      },
      intermediate: {
        number: 308,
        title: "Love One Another"
      },
      closing: {
        number: 129,
        title: "Where Can I Turn for Peace?"
      }
    },
    prayers: {
      opening: "Carter McBride",
      closing: "Whitley McBride"
    },
    speakers: [
      "Emily Fairchild",
      "Taylor Fairchild",
      "High Council Chris Tambasco"
    ],
    newMembers: ["Rob & Emily Thunderdome"]
  };
}

async function main() {
  const data = getData();
  const templatePath = path.resolve(
    "templates",
    "sacrament-agenda.md.handlebars"
  );
  try {
    const result = await compile(templatePath, data);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

main();
