 CREATE TABLE reviews (
   review_id SERIAL PRIMARY KEY,
   inv_id INTEGER NOT NULL REFERENCES inventory(inv_id),
   account_id INTEGER NOT NULL REFERENCES account(account_id),
   review_text TEXT NOT NULL,
   review_rating INTEGER NOT NULL CHECK (review_rating BETWEEN 1 AND 5),
   review_date TIMESTAMP DEFAULT NOW(),
   is_approved BOOLEAN DEFAULT FALSE
);

SELECT * FROM inventory WHERE inv_id = 2;