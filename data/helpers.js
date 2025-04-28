import {ObjectId} from "mongodb";
export function checkString(str, name) {
    if(!(typeof str === "string")) {
        return null;
    }
    str = str.trim();
    if(str.length == 0) {
        return null;
    }
    return str;
}
export function checkId(id) {
    if(typeof id !== "string") {
        id = id.toString();
    }
    id = checkString(id, "id");
    if(!id) {
        return null;
    }
    if(!(ObjectId.isValid(id))) {
        return null;
    }
    return id;
}