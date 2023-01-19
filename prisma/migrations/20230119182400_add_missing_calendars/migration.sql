INSERT INTO
    "calendars" ("userId", "updatedAt", "createdAt")
SELECT
    "userId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM
    (
        SELECT
            "users"."id" AS "userId",
            count("calendars"."id") AS "calendarsCount"
        FROM
            "users"
            LEFT JOIN "calendars" ON ("users"."id" = "calendars"."userId")
        GROUP BY
            "users"."id"
    ) AS "res"
WHERE
    "calendarsCount" = 0