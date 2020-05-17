import React from "react";
import Review from "./Review.js";
import AddReview from "./AddReview.js";
import { Grid, Divider, Button, Modal } from "semantic-ui-react";
import "./ReviewsModule.scss";

class ReviewsModule extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reviews: [],
      visible: 2,
      error: false,
      open: false
    };
    this.loadMore = this.loadMore.bind(this);
  }

  show = (dimmer) => () => this.setState({ dimmer, open: true })

  close = () => this.setState({ open: false })

  loadMore() {
    this.setState((prev) => {
      return {visible: prev.visible + 2};
    });
  }

  componentDidMount(props) {
    this.getReviews();
  }

  getReviews() {
    fetch("/reviews/course?courseID="+ encodeURIComponent(this.props.courseID), {
      method: "GET"
    }).then(data => {return data.json()})
    .then(res => {
      this.setState({reviews: res});
    }).catch((e) => {
      console.error(e);
      this.setState({
        error: true
      });
    });
  }

  render() {
    const { open, dimmer } = this.state

    return (
      <div className="review-module-container" style={{ marginTop: "36px", marginBottom: "200px" }}>
        <Grid.Row className="feature-label" >
          <div className="review_feature-label">
            <h2 style={{margin: "0"}}><span role="img" aria-label="speech">💬</span> Review & Discussion</h2>
            <Button className={"add_review-button"} onClick={this.show('inverted')}>Add Review</Button>
          </div>
          <Divider />
        </Grid.Row>

        {this.state.reviews.length > 0 && ( 
          <div>
            {this.state.reviews.slice(0, this.state.visible).map((item, index) => (
              <div key={index}>
                <Review reviewData={item} getReviews={this.getReviews}/>
              </div>
            ))}

            {this.state.visible < this.state.reviews.length &&
              <Button onClick={this.loadMore}>Load more</Button>
            }

          </div> )

        }

        {this.state.reviews.length === 0 && ( 
        <div>
          <h3>No reviews found. Be the first! <span role="img" aria-label="winky face">😉</span></h3>
        </div> )

        }

        <Modal dimmer={dimmer} open={open} onClose={this.close}>
          <Modal.Content>
            <AddReview courseID={this.props.courseID} professorHistory={this.props.professorHistory}/>
          </Modal.Content>
        </Modal>

      </div>
    );
    }

  }

export default ReviewsModule;
