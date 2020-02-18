import React from "react";

const horizontalStyle = {display: "flex", 
                   flexDirection: "row"};
const dependencyStyle = {backgroundColor: "lightBlue"}
const originStyle = {backgroundColor: "pink"}
const treeStyle = {border: "2px solid red", margin: "15px"}
const nodeStyle = {backgroundColor: "yellow"}
const leafStyle = {backgroundColor: "lightGreen"}
const branchStyle = {listStyleType: "none"}

class Tree extends React.Component{
    render(){
        let prerequisite = this.props.prerequisiteJSON;
        let isValueNode = typeof prerequisite === 'string';
        return (
            <div style={treeStyle}>
                {/* If is just a value node */}
                {isValueNode && 
                <div>
                    <span style={leafStyle}>
                        {prerequisite}
                    </span>                    
                </div>
                }
                {/* If is a subtree */}
                {!isValueNode && 
                <div style={horizontalStyle}>
                    <div>
                        <span style={nodeStyle}>
                            {prerequisite.hasOwnProperty('OR') ? 'ONE OF' : 'ALL OF'}
                        </span>                        
                    </div>
                    <div>
                        <ul style={branchStyle}>
                            {prerequisite[Object.keys(prerequisite)[0]].map((child, index) => (
                            <li key={index}>
                                <Tree prerequisiteJSON={child}/>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
                }
            </div>
        )
    }
}

class PrereqTree extends React.Component {
    constructor(props){
        super(props)
    }

    render() {
        if(this.props.id == undefined)
            return ""
        return (
            <div style={horizontalStyle}>
                {/* Display dependencies */}
                <div>
                    <ul>
                        {this.props.dependencies.map((dependency, index) => (
                        <li key={index}>
                            <span style={dependencyStyle}>
                                {dependency}
                            </span>                            
                        </li>
                        ))}
                    </ul>
                </div>
                {/* Display the class id */}
                <div>
                    <span style={originStyle}>
                        {this.props.id}
                    </span>                    
                </div>
                {/* Spawns the root of the prerequisite tree */}
                <div>
                    <Tree prerequisiteJSON={this.props.prerequisiteJSON}/>
                </div>
            </div>
        )
    }
};

export default PrereqTree;
