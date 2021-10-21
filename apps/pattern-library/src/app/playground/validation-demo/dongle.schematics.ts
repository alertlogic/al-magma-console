export const dongleTypeSchematics:any = {
    "https://alertlogic.com/schematics/dongle": {
        "definitions": {
            "dongle": {
                "type": "object",
                "properties": {
                    "id": { type: "string" },
                    "name": { type: "string" },
                    "created": { "$ref": "https://alertlogic.com/schematics/shared#/definitions/changestamp" },
                    "modified": { "$ref": "https://alertlogic.com/schematics/shared#/definitions/changestamp" },
                    "locked": {
                        "anyOf": [
                            { "$ref": "https://alertlogic.com/schematics/shared#/definitions/changestamp" },
                            { "type": "boolean" }
                        ]
                    },
                    "linked_assets": {
                        "type": "array",
                        "items": { "$ref": "#/definitions/assetRecord" }
                    },
                    "ancestor": { "$ref": "#/definitions/dongle" }
                },
                "required": [ "id", "name" ]
            },
            "dongleList": {
                "type": "object",
                "properties": {
                    "dongles": {
                        "type": "array",
                        "items": { "$ref": "#/definitions/dongle" }
                    }
                },
                "required": [ "dongles" ]
            },
            "assetRecord": {
                "type": "object",
                "properties": {
                    "key": { "type": "string" },
                    "type": { "type": "string" }
                },
                "required": [ "key", "type" ]
            }
        }
    }
};
