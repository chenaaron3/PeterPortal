CREATE TABLE reviews (
    id int NOT NULL AUTO_INCREMENT,
    body text NOT NULL,
    rating int NOT NULL,
    difficulty int NOT NULL,
    user_id int,
    course_id varchar(255) NOT NULL,
    prof_id	varchar(255) NOT NULL,
    submitted_at date NOT NULL,
    grade varchar(255) NOT NULL,
    pub_status ENUM ('published', 'removed', 'unverified') NOT NULL,
    up_votes int DEFAULT 0,
    down_votes int DEFAULT 0,
    PRIMARY KEY(id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);