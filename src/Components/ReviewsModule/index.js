import React from "react";
import Review from "./Review";

class ReviewsModule extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div style={{marginTop: "26px"}}>
            <h1>Review and Discussion</h1>
            <div>
                <Review />
                <Review />
                <Review />
            </div>
        </div>
    );
  }
}

export default ReviewsModule;
