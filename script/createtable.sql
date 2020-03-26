CREATE TABLE Reviews (
    reviewID int NOT NULL AUTO_INCREMENT,
    reviewText text,
    rating int,
    userID varchar(255),
    courseID varchar(255),
    profID	varchar(255),
    dateSubmitted date,
    grade varchar(255),
    forCredit boolean,
    flagged boolean,
    PRIMARY KEY(reviewID)
);