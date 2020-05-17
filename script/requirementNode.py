CONFLICT_PREREQ_NAME = "output/conflict_prereq.txt"

class Node:
    def __init__(self, type = "?", vals = None):
        # holds other nodes
        self.values = vals if vals != None else list()
        # can be ?|&,|,#
        self.type = type
        # if &| nodes only have 1 value, set them to their child

    def collapse(self):
        if self.type == "#" or self.type == "?":
            return False
        elif self.type == "|" or self.type == "&":
            collasped = False
            for node in self.values:
                node.collapse()
            if len(self.values) == 1:
                lonelyChild = self.values[0]
                self.type = lonelyChild.type
                self.values = lonelyChild.values
            else:
                newValues = []
                for node in self.values:
                    if self.type == node.type:
                        newValues += node.values
                    else:
                        newValues.append(node)
                self.values = newValues

    # classHistory: list of classes taken
    # return whether or not this requirement is met
    def prereqsMet(self, classHistory : list):
        # if origin only has 1 value
        if self.type == "?":
            return self.values[0].prereqsMet(classHistory)
        # if is value node
        elif self.type == "#":
            return self.values[0] in classHistory
        # if is and node
        elif self.type == "&":
            # every sub requirement must be met
            for subReq in self.values:
                if not subReq.prereqsMet(classHistory):
                    return False
            return True
        # if is or node
        elif self.type == "|":
            # at least 1 sub requirement must be met
            for subReq in self.values:
                if subReq.prereqsMet(classHistory):
                    return True
            return False
        # should never reach here       
        else:
            print("prereqsMet::Invalid Node Type", self.type)   

    # see if a value is contained in any # node
    def __contains__(self, value):
        if self.type == "#" or self.type == "?":
            return self.values[0] == value
        elif self.type == "|" or self.type == "&":
            for node in self.values:
                if value in node:
                    return True
            return False
    
    def prettyPrint(self):
        # if origin only has 1 value
        if self.type == "?":
            return str(self.values[0])
        # if is value node
        elif self.type == "#":
            return str(self.values[0])
        # if is and node
        elif self.type == "&":
            # print within ()
            res = '( '
            for i in range(len(self.values)):
                res += " AND " if i != 0 else ""
                res += self.values[i].prettyPrint()
            res += " )"
            return res
        # if is or node    
        elif self.type == "|":
            # print within ()
            res = '( '
            for i in range(len(self.values)):
                res += " OR " if i != 0 else ""
                res += self.values[i].prettyPrint()
            res += " )"
            return res
        # should never reach here
        else:
            print("Node:__str__::Invalid Node Type", self.type)  

    # and nodes are surrounded with []
    # or nodes are surrounded with {}
    # Example: 1 and 2 and (3 or (4 and 5)) and 6 -> [1,2,{3,[4,5]},6]
    # returns a string representation of this requirement
    def __str__(self):
        # if origin only has 1 value
        if self.type == "?":
            return '{"AND":[' + str(self.values[0]) + "]}"
        # if is value node
        elif self.type == "#":
            return '"' + str(self.values[0]) + '"'
        # if is and node
        elif self.type == "&":
            # print within []
            res = '{"AND":['
            for i in range(len(self.values)):
                res += "," if i != 0 else ""
                res += str(self.values[i])
            res += "]}"
            return res
        # if is or node    
        elif self.type == "|":
            # print within {}
            res = '{"OR":['
            for i in range(len(self.values)):
                res += "," if i != 0 else ""
                res += str(self.values[i])
            res += "]}"
            return res
        # should never reach here
        else:
            print("Node:__str__::Invalid Node Type", self.type)  

# tokens: list of tokens that represent a class requirement. Consist of integers, 'and', 'or', '(', ')'
# lookup: list of classes that the integers in the tokens list represent
# courseNumber: string representing class (eg. ICS 53)
# returns a Node representing the requirements                 
def nodify(tokens, lookup, courseNumber):
    # uses stack to see which and/or node to add a value in
    stack = [Node("?")]
    for token in tokens:
        # create a new sub requirement
        if token == "(":
            stack.insert(0, Node())
        # adds the sub requirement
        elif token == ")":
            subNode = stack.pop(0)
            # if node type is ?, it tried to be an &| node, but only had 1 value
            if subNode.type == "?":
                # convert the node into a # type 
                subNode.type = "#"
                # take out the nested # node
                subNode.values = subNode.values[0].values
            stack[0].values.append(subNode)
        # sets the type to &
        elif token.lower() == "and":
            # if has conflicting logic (eg. A or B and C)
            if stack[0].type == "|":
                f = open(CONFLICT_PREREQ_NAME, "a")
                f.write(f"{courseNumber}\n")
                f.close()
                # wrap the previous values into a subnode (eg. (A or B) and C)
                subNode = Node(stack[0].type, stack[0].values.copy())
                # set context node to just the subnode
                stack[0].values = [subNode]
            stack[0].type = "&"
        # sets the type to |
        elif token.lower() == "or":
            # if has conflicting logic (eg. A and B or C)
            if stack[0].type == "&":
                f = open(CONFLICT_PREREQ_NAME, "a")
                f.write(f"{courseNumber}\n")
                f.close()
                # wrap the previous values into a subnode (eg. (A and B) or C)
                subNode = Node(stack[0].type, stack[0].values.copy())
                # set context node to just the subnode
                stack[0].values = [subNode]
            stack[0].type = "|"
        # adds a class requirement
        else: 
            newNode = Node("#")
            newNode.values.append(lookup[int(token)])
            stack[0].values.append(newNode)
    # is something went wrong
    if len(stack) != 1:
        print("Non Matching Parentheses!")
        return None
    return stack[0]    