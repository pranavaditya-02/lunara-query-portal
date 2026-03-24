import { pool } from "../config/db.js";
import { initializeDatabase } from "../services/initDb.js";

const mockQueries = [
  {
    name: "Aarav",
    query:
      "Will the Lunara event registration desk stay open after 6:30 PM for late arrivals from outstation?",
    answer:
      "Yes. Registration support will remain active until 8:00 PM near Gate B. Please carry your booking ID.",
    status: "resolved",
  },
  {
    name: "Meera",
    query:
      "Is there a separate queue for pre-booked VIP pass holders at the main entrance?",
    answer:
      "Yes, VIP guests can use the fast-track lane at Gate A. Staff with yellow badges will guide you.",
    status: "resolved",
  },
  {
    name: "Rohan",
    query:
      "Can I transfer my Lunara ticket to my friend if I cannot attend due to travel delays?",
    answer: "",
    status: "pending",
  },
  {
    name: "Nisha",
    query:
      "Will there be enough parking after 7 PM, and is there any paid valet option at the venue?",
    answer:
      "General parking is available in Zones P1 and P2. Valet starts at 6:00 PM near the south drop-off.",
    status: "resolved",
  },
  {
    name: "Karthik",
    query:
      "Is outside food allowed for attendees with dietary restrictions, especially diabetic-friendly snacks?",
    answer: "",
    status: "pending",
  },
  {
    name: "Sana",
    query:
      "What is the expected start time for the headline act tonight, and will there be schedule updates live?",
    answer:
      "The headline segment is planned for 9:15 PM. Live timeline updates are posted on the in-venue display boards.",
    status: "resolved",
  },
  {
    name: "Dev",
    query:
      "Do student ID holders get any on-site upgrade options from general access to lounge access?",
    answer: "",
    status: "pending",
  },
  {
    name: "Isha",
    query:
      "Is there a dedicated helpdesk for lost items like phone wallets and jackets during the event?",
    answer:
      "Yes, lost and found is managed at the Helpdesk counter near Food Court 2 until event close.",
    status: "resolved",
  },
  {
    name: "Vikram",
    query:
      "Will the Lunara venue allow re-entry if we step out for dinner and return before the final set?",
    answer:
      "Re-entry is permitted with a valid wristband and ticket QR. Re-entry closes at 10:30 PM.",
    status: "resolved",
  },
  {
    name: "Ananya",
    query:
      "Are there shuttle buses from Central Metro after the event ends around midnight?",
    answer: "",
    status: "pending",
  },
];

async function seedMockQueries() {
  await initializeDatabase();

  let inserted = 0;
  let skipped = 0;

  for (let index = 0; index < mockQueries.length; index += 1) {
    const item = mockQueries[index];

    const [exists] = await pool.query(
      "SELECT id FROM queries WHERE name = ? AND query = ? LIMIT 1",
      [item.name, item.query]
    );

    if (exists.length > 0) {
      skipped += 1;
      continue;
    }

    const minutesAgo = (mockQueries.length - index) * 7;
    const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);

    await pool.query(
      "INSERT INTO queries (name, query, answer, status, timestamp) VALUES (?, ?, ?, ?, ?)",
      [item.name, item.query, item.answer, item.status, timestamp]
    );

    inserted += 1;
  }

  console.log(`Mock seed complete. Inserted: ${inserted}, Skipped: ${skipped}`);
  await pool.end();
}

seedMockQueries()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Failed to seed mock queries:", error.message);
    await pool.end();
    process.exit(1);
  });
