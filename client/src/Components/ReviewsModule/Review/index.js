import React from "react";
import avatar from "../../../Assets/default-avatar.png";
import "./review.scss";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

class Review extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={"review_container"}>
        <div className={"avatar_container"}>
          {/* avater here! */}
          <img src={avatar}></img>
        </div>

        <div className={"content_container"}>
          {/* review context */}
          <div className={"review_header_container"}>
               {/* review info header */}
            <div className={"review_header_info_container"}>
              <h2 id={"reviewer_name"}>{this.props.reviewData.userID}</h2>
              <h4 id={"timestamp"}>{this.props.reviewData.dateSubmitted}</h4>

              <div className={"reviewer_meta_container"}>
                <div>
                  <h5>
                    <b>Taken with:</b> {this.props.reviewData.profID}
                  </h5>
                </div>

                <div>
                  <h5>
                    <b>For Credit:</b> {this.props.reviewData.forCredit ? "Yes" : "No"}
                  </h5>
                </div>

                <div>
                  <h5>
                    <b>Grade:</b> {this.props.reviewData.grade}
                  </h5>
                </div>
              </div>
            </div>

           
            <div className={"review_rating_container"}>
              <CircularProgressbar value={this.props.reviewData.rating} maxValue={5} text={this.props.reviewData.rating} />
            </div>
          </div>

          <div className={"review_body_container"}><p>{this.props.reviewData.reviewText}</p></div>
        </div>
      </div>
    );
  }
}

export default Review;
