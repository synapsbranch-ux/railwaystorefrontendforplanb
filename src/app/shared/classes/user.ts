let getAddress :any ;

// let shareDetails = (id:String) => {
//    let getID = () => {
//        return id;
//    }
//    return getID;
// }

let setID = (id:String) => {
     getAddress = id;
}

export let UserAddress = {
    setID:setID,
    getAddress: getAddress
}