var schema = {
    "type": "object",
    "properties": {
        "network": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["success", "failure"]
                },
                "timestamp": {
                    "type": "string",
                    "enum": ["2021-05-23"]
                }
            }
        }
    },
}