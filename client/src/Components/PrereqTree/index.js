import React from "react";
import { Button } from 'semantic-ui-react';
import "./prereq-tree.scss"

const horizontalStyle = {display: "flex", 
                   flexDirection: "row"};
const dependencyStyle = {backgroundColor: "lightBlue"}
const treeStyle = { margin: "15px"}
const nodeStyle = {backgroundColor: "yellow"}
// const leafStyle = {backgroundColor: "lightGreen"}
const branchStyle = {listStyleType: "none", margin: "10px"}

class Tree extends React.Component{
    render(){
        let prerequisite = this.props.prerequisiteJSON;
        let isValueNode = typeof prerequisite === 'string';
        return (
            <div style={{margin: "auto"}}>
                {/* If is just a value node */}
                {isValueNode && 

                    <span>
                        <a href="" role="button" className={"node ui basic button"} basic>
                         {prerequisite}
                         </a>
                    </span>                    
        
                }
                {/* If is a subtree */}
                {!isValueNode && 
                <div style={horizontalStyle}>

                        <span style={{margin: "auto"}}>
                            <p>{prerequisite.hasOwnProperty('OR') ? 'one of' : 'all of'}</p>
                        </span>                        
   
                    
                        <ul style={branchStyle}>
                            {prerequisite[Object.keys(prerequisite)[0]].map((child, index) => (
                            <li key={index}>
                                <Tree prerequisiteJSON={child}/>
                            </li>
                            ))}
                        </ul>
                 
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
        let hasPrereqs = this.props.prerequisiteJSON !== "";

        if(this.props.id == undefined)
            return ""
        return (
            <div style={horizontalStyle}>
                {/* Display dependencies */}
                <div style={{margin: "auto"}}>
                    <ul>
                        {this.props.dependencies.map((dependency, index) => (
                        <div>
                            <span>
                            <Button className={"node"} basic color='teal'>
                                {dependency}
                            </Button>
                            </span>                            
                        </div>
                        ))}
                    </ul>
                </div>
                {/* Display the class id */}
                <div style={horizontalStyle}>
                    <span style={{margin: "auto", padding: "0 40px 0 40px"}}>
                        <p>needs</p>
                    </span> 
                </div>
                <div style={{margin: "auto"}}>                 
                    <span>
                        <Button className={"node"} basic color='blue'>{this.props.id}</Button>
                    </span>  
                </div>
                {/* Spawns the root of the prerequisite tree */}
                <div style={{display: 'flex'}}>
                    {hasPrereqs && <Tree prerequisiteJSON={JSON.parse(this.props.prerequisiteJSON)}/>}
                    {!hasPrereqs && <span>No Prerequisites!</span>}
                </div>
            </div>
        )
    }
};

export default PrereqTree;
