import React from "react";
import avatar from "../../assets/default_avatar.png";
import Review from "./Review";
import { Form, TextArea, Checkbox, Dropdown, Button } from "semantic-ui-react";

const professorOptions = [
  { key: "pattis", value: "pattis", text: "Richard Pattis" },
  { key: "thornton", value: "thornton", text: "Alexander Thornton" }
];

const creditOptions = [
  { key: "credit", value: "yes", text: "Taken for credit" },
  { key: "p/np", value: "no", text: "Taken as P/NP" }
];

const gradeReceived = [
  { key: "credit", value: "yes", text: "A" },
  { key: "p/np", value: "no", text: "B" },
  { key: "p/np", value: "no", text: "C" },
  { key: "p/np", value: "no", text: "D" },
  { key: "p/np", value: "no", text: "F" },
  { key: "p/np", value: "no", text: "P" },
  { key: "p/np", value: "no", text: "NP" },
  { key: "p/np", value: "no", text: "W" },
  { key: "p/np", value: "no", text: "I" },
  { key: "p/np", value: "no", text: "S" },
  { key: "p/np", value: "no", text: "U" },
  { key: "p/np", value: "no", text: "IP" },
];

class ReviewsModule extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{ marginTop: "26px", marginBottom: "200px" }}>
        <h1>Review and Discussion</h1>
        <div>
          <Review />
          <Review />
          <Review />
          <div style={{ marginTop: "100px" }}>
            {/* <div className={"avatar_container"}>
                    <img src={avatar}></img>
                  </div> */}

            <Form>
              <h1 id={"reviewer_name"}>
                Peter Anteater
                <Checkbox
                  style={{ marginLeft: "18px" }}
                  label="Post review as Anonymous"
                />
              </h1>

              <div style={{ display: "flex", marginBottom: "16px"}}>
              <Dropdown
                clearable
                fluid
                search
                selection
                options={professorOptions}
                placeholder="Select Professor"
              />

              <Dropdown
                placeholder="Grade Option"
                fluid
                selection
                options={creditOptions}
              />

              <Dropdown
                placeholder="Grade Received"
                fluid
                selection
                options={gradeReceived}
              />
              </div>
              <TextArea placeholder="Write your review here" />

              <Button>Submit</Button>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

export default ReviewsModule;
