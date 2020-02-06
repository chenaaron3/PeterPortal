import React from "react";
import avatar from "../../../assets/default_avatar.png";
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
              <h2 id={"reviewer_name"}>Peter Anteater</h2>
              <h4 id={"timestamp"}>two days ago</h4>

              <div className={"reviewer_meta_container"}>
                <div>
                  <h5>
                    <b>Taken with:</b> Richard Pattis
                  </h5>
                </div>

                <div>
                  <h5>
                    <b>For Credit:</b> Yes
                  </h5>
                </div>

                <div>
                  <h5>
                    <b>Grade:</b> A
                  </h5>
                </div>
              </div>
            </div>

           
            <div className={"review_rating_container"}>
              <CircularProgressbar value={3} maxValue={5} text={`3.0`} />
            </div>
          </div>

          <div className={"review_body_container"}><p>Pattis throws a LOT at you, especially be careful if you take 46 in Fall (recruiting). That being said, I definitely learned sooo much, especially compared with Shindler's 46. If you want to learn a lot about C++ and Data Structures take Pattis but Shindler (or another prof) will be a lot easier.</p></div>
        </div>
      </div>
    );
  }
}

export default Review;
