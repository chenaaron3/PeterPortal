import React from 'react';
import { Grid, Card} from "semantic-ui-react";
import "./GradeDist.scss"

class GradeDist extends React.Component{
    render() {
        return(
            <Grid.Row className="course_content-container course_prereq-tree-container">
              <Card>
                <Card.Content>
                  <Card.Header>Grade Distribution</Card.Header>
                </Card.Content>
                <Card.Content>
                  <div>

                    <h1>Hello World</h1>

                  </div>
                </Card.Content>
              </Card>
            </Grid.Row>
        );
    }
}

export default GradeDist;