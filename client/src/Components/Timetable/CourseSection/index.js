import React from 'react';

class CourseSection extends React.Component{
    render() {
        return(
            <div style={{minWidth: (this.props.duration * 1.5) + "px"}} class="ui teal button course-section"><p>PSLH 100<br/>LEC[A]</p></div>
        );
    }
}

export default CourseSection;