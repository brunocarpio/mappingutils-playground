let json = `{
    "event": {
        "agency": "MI6",
        "data": {
            "name": "James",
            "lname": "Bond",
            "id": "007"
        }
    }
}`;

let mapping = `{
    "$.code": "$.event.data.id",
    "$.private.agency": "$.event.agency",
}`;

export default {
    json,
    mapping,
};
