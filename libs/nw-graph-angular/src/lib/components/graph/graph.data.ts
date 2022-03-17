export const rootNodeId = "90098302633";
export const dataLoading = false;
export const config = {
    "maxSelectedNodes": 100,
    "displayLabel": true,
    "autoExpand": false,
    "processNodeWithUnknownNodeType": true,
    "numHops": 2,
    "maxNodeCount": 5,
    "viewportHeight": 700,
    "nodeRadius": 20,
    "rootNodeRadius": 27,
    "nodeBorderWidth": 4,
    "nodeAlertIconSize": 17,
    "displayEdgeDirection": true,
    "node": { "parentRawPath": ["data", "0", "printSet"],
              "nodeIdAttributeKey": "v_id",
              "nodeTypeAttributeKey": "v_type",
              "nodeTitleAttributeKey": "label",
              "nodeNeighborsLoadedAttributeKey": "neighboursLoaded",
              "nodeNeighborsLoadedAttributeDefaultValue": false,
              "nodeCollapsedAttributeKey": "collapsed",
              "nodeCollapsedAttributeDefaultValue": false,
              "nodeTypes": [{ "name": "gfctEntity",
                              "displayName": "Entity",
                              "color": "#80B9E7",
                              "imagePath": "assets/images/entity.png",
                              "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true },
                                                  { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                  { "key": "entitylabel", "displayName": "Entity Label", "rawPath": ["attributes", "entitylabel"], "tooltip": true },
                                                  { "key": "label", "displayName": "Entity Label", "rawPath": ["attributes", "entitylabel"], "tooltip": true },
                                                  { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                  { "key": "collapsed", "displayName": "collapsed", "rawPath": ["attributes", "collapsed"], "tooltip": true },
                                                  { "key": "entityid", "displayName": "Entity Id", "rawPath": ["attributes", "entityid"], "tooltip": true },
                                                  { "key": "src", "displayName": "Source", "rawPath": ["attributes", "src"], "tooltip": true },
                                                  { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true },
                                                  { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                  { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                  { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]},
                            { "name": "gfctParty",
                            "displayName": "Party",
                            "color": "#CCEBF8",
                            "imagePath": "assets/images/party.png",
                            "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true }, 
                                                { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                { "key": "label", "displayName": "Party Full Name", "rawPath": ["attributes", "partyfullname"], "tooltip": true },
                                                { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                { "key": "collapsed", "displayName": "collapsed", "rawPath": ["attributes", "collapsed"], "tooltip": true },
                                                { "key": "amlptyId", "displayName": "AML Party Id", "rawPath": ["attributes", "amlptyId"], "tooltip": true },
                                                { "key": "ptyid", "displayName": "Party Id", "rawPath": ["attributes", "ptyid"], "tooltip": true },
                                                { "key": "gcino", "displayName": "GCI Number", "rawPath": ["attributes", "gcino"], "tooltip": true },
                                                { "key": "mlid", "displayName": "ML Id", "rawPath": ["attributes", "mlid"], "tooltip": true },
                                                { "key": "itn", "displayName": "ITN", "rawPath": ["attributes", "itn"], "tooltip": true },
                                                { "key": "ssn", "displayName": "SSN", "rawPath": ["attributes", "ssn"], "tooltip": true },
                                                { "key": "ein", "displayName": "EIN", "rawPath": ["attributes", "ein"], "tooltip": true },
                                                { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true },
                                                { "key": "scorecat", "displayName": "scorecat", "rawPath": ["attributes", "scorecat"], "tooltip": true },
                                                { "key": "prdcd", "displayName": "prdcd", "rawPath": ["attributes", "prdcd"], "tooltip": true },
                                                { "key": "naicscd", "displayName": "naicscd", "rawPath": ["attributes", "naicscd"], "tooltip": true },
                                                { "key": "naicsde", "displayName": "naicsde", "rawPath": ["attributes", "naicsde"], "tooltip": true },
                                                { "key": "ptytypcd", "displayName": "ptytypcd", "rawPath": ["attributes", "ptytypcd"], "tooltip": true },
                                                { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]},
                            { "name": "gfctAccount",
                              "displayName": "Account",
                              "color": "#93CF80",
                              "imagePath": "assets/images/account.png",
                              "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true },
                                                  { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                  { "key": "label", "displayName": "Account Number", "rawPath": ["attributes", "accno"], "tooltip": true },
                                                  { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                  { "key": "amlaccid", "displayName": "AML Account Id", "rawPath": ["attributes", "amlaccid"], "tooltip": true },
                                                  { "key": "accnm", "displayName": "Account Name", "rawPath": ["attributes", "accnm"], "tooltip": true },
                                                  { "key": "accopendate", "displayName": "Account Open Date", "rawPath": ["attributes", "accopendate"], "tooltip": true },
                                                  { "key": "accptyrolecd", "displayName": "Account Party Role Code", "rawPath": ["attributes", "accptyrolecd"], "tooltip": true },
                                                  { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true }, 
                                                  { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                  { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                  { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]},
                            { "name": "gfctAddress",
                            "displayName": "Address",
                            "color": "#AF90B3",
                            "imagePath": "assets/images/address.png",
                            "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true },
                                                { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                { "key": "label", "displayName": "Party Address", "rawPath": ["attributes", "partyaddress"], "tooltip": true },
                                                { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true },
                                                { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]},
                            { "name": "gfctSSN",
                              "displayName": "SSN",
                              "color": "#F8D480",
                              "imagePath": "assets/images/ssn.png",
                              "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true },
                                                  { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                  { "key": "label", "displayName": "SSN", "rawPath": ["attributes", "ssn"], "tooltip": true },
                                                  { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                  { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true },
                                                  { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                  { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                  { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]},
                            { "name": "gfctPhone",
                              "displayName": "Phone",
                              "color": "#66CDBD",
                              "imagePath": "assets/images/phone.png",
                              "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true },
                                                  { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                  { "key": "label", "displayName": "Phone Number", "rawPath": ["attributes", "phonenumber"], "tooltip": true },
                                                  { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                  { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true },
                                                  { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                  { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                  { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]},
                            { "name": "gfctEmail",
                              "displayName": "Email",
                              "color": "#EA7600",
                              "imagePath": "assets/images/email.png",
                              "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true },
                                                  { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                  { "key": "label", "displayName": "Email Address", "rawPath": ["attributes", "emailaddress"], "tooltip": true },
                                                  { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                  { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true },
                                                  { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                  { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                  { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]},
                            { "name": "gfctEin",
                              "displayName": "EIN",
                              "color": "#F8D480",
                              "imagePath": "assets/images/ein.png",
                              "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true },
                                                  { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                  { "key": "label", "displayName": "EIN", "rawPath": ["attributes", "ein"], "tooltip": true },
                                                  { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                  { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true },
                                                  { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                  { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                  { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]},
                            { "name": "gfctITN",
                              "displayName": "ITN",
                              "color": "#F8D480",
                              "imagePath": "assets/images/itn.png",
                              "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true },
                                                  { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                  { "key": "label", "displayName": "ITN", "rawPath": ["attributes", "itn"], "tooltip": true },
                                                  { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                  { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true },
                                                  { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                  { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                  { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]},
                            { "name": "gfctCase",
                              "displayName": "Case",
                              "color": "#E28897",
                              "imagePath": "assets/images/case.png",
                              "nodeAttributes": [ { "key": "v_id", "displayName": "Node ID", "rawPath": ["v_id"], "tooltip": true },
                                                  { "key": "v_type", "displayName": "Node Type", "rawPath": ["v_type"], "tooltip": true },
                                                  { "key": "label", "displayName": "Case ID", "rawPath": ["attributes", "caseid"], "tooltip": true },
                                                  { "key": "neighboursLoaded", "displayName": "isLoaded", "rawPath": ["attributes", "isLoaded"], "tooltip": true },
                                                  { "key": "casetype", "displayName": "Case Type", "rawPath": ["attributes", "casetype"], "tooltip": true },
                                                  { "key": "flucd", "displayName": "FLU Code", "rawPath": ["attributes", "flucd"], "tooltip": true },
                                                  { "key": "fludescription", "displayName": "FLU Description", "rawPath": ["attributes", "fludescription"], "tooltip": true },
                                                  { "key": "isskewed", "displayName": "isskewed", "rawPath": ["attributes", "isskewed"], "tooltip": true },
                                                  { "key": "@visited", "displayName": "@visited", "rawPath": ["attributes", "@visited"], "tooltip": true } ]}
    ]},
    "edge": { "parentRawPath": ["data", "1", "@@edgeSet"],
              "edgeSourceIdAttribute": { "key": "from_id", "displayName": "Source Node Id", "rawPath": ["from_id"], "tooltip": true },
              "edgeTargetIdAttribute": { "key": "to_id", "displayName": "Target Node Id", "rawPath": ["to_id"], "tooltip": true },
              "edgeTitleAttribute": { "key": "e_type", "displayName": "Type", "rawPath": ["e_type"], "tooltip": true },
              "edgeSourceIdAttributeKey": "from_id",
              "edgeTargetIdAttributeKey": "to_id",
              "edgeTitleAttributeKey": "e_type",
              "edgeAttributes": [ { "key": "e_type", "displayName": "Edge Type", "rawPath": ["e_type"], "tooltip": true },
                                  { "key": "from_id", "displayName": "Source Id", "rawPath": ["from_id"], "tooltip": true },
                                  { "key": "from_type", "displayName": "Source Type", "rawPath": ["from_type"], "tooltip": true },
                                  { "key": "to_id", "displayName": "Target Id", "rawPath": ["to_id"], "tooltip": true },
                                  { "key": "to_type", "displayName": "Target Type", "rawPath": ["to_type"], "tooltip": true },
                                  { "key": "directed", "displayName": "Directed", "rawPath": ["directed"], "tooltip": true }]
    },
    "alert": {
      "nodeAttributes": [{ "nodeType": "gfctCase", "attribute": "casetype", "condition": "typeof value === 'string' && (value.toUpperCase() === 'AML' || value.toUpperCase() === 'FRD')", "position": "NE", "message": "AML/FRD Alert", "color": "#fdee00"},
                          { "nodeType": "gfctEntity", "attribute": "src", "condition": "typeof value === 'string' && value.toUpperCase() === 'DNDB'", "position": "N", "message": "DNDB Alert", "imagePath": "assets/images/itn.png", "color": "#ff0000"}]
    }
  }; 
  
export const data = {
  "status": "success",
  "timestamp": "2021-05-23",
  "data": [
    {
      "printSet": [
        {
          "v_id": "AML-2021040158769",
          "v_type": "gfctCase",
          "attributes": {
            "caseid": "AML-2021040158769",
            "casetype": "AML",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "90098302633",
          "v_type": "gfctEntity",
          "attributes": {
            "entityid": "90098302633",
            "entitylabel": "SURESH KUMAR SADASIVAN NAIR",
            "src": "CP",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "90098302744",
          "v_type": "gfctEntity",
          "attributes": {
            "entityid": "90098302744",
            "entitylabel": "SID TOMAR",
            "src": "DNDB",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "302190803",
          "v_type": "gfctParty",
          "attributes": {
            "amlptyId": "302190803",
            "partyfullname": "SURESH KUMAR SADASIVAN NAIR",
            "ptyid": "10000637301",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "140 ETHEL RD W STE S 08854, PISCATAWAY, NJ, US",
          "v_type": "gfctAddress",
          "attributes": {
            "partyaddress": "140 ETHEL RD W STE S 08854, PISCATAWAY, NJ, US",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "140 LINCKON ST 08821, FREEHOLD, NJ, US",
          "v_type": "gfctAddress",
          "attributes": {
            "partyaddress": "140 LINCKON ST 08821, FREEHOLD, NJ, US",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "150347655",
          "v_type": "gfctSSN",
          "attributes": {
            "ssn": "150347655",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "834527376",
          "v_type": "gfctSSN",
          "attributes": {
            "ssn": "834527376",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "564738",
          "v_type": "gfctEin",
          "attributes": {
            "ein": "564738",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "302190804",
          "v_type": "gfctParty",
          "attributes": {
            "amlptyId": "302190804",
            "partyfullname": "SURESH SADASIVAN NAIR",
            "ptyid": "10000637302",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "90098924561",
          "v_type": "gfctEntity",
          "attributes": {
            "entityid": "90098924561",
            "entitylabel": "Manish Singhal",
            "src": "CP",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "302190704",
          "v_type": "gfctParty",
          "attributes": {
            "amlptyId": "302190704",
            "partyfullname": "Saurabh Sharma",
            "ptyid": "10000637704",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "isLoaded": true,
            "@visited": true
          }
        },
        {
          "v_id": "9137353861",
          "v_type": "gfctAccount",
          "attributes": {
            "amlaccid": "9137353861",
            "accno": "4147342071409744",
            "accnm": "SURESH KUMAR SADASIVAN NAIR",
            "accopendate": "2019-02-19",
            "accptyrolecd": "BOR",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "9063500632",
          "v_type": "gfctAccount",
          "attributes": {
            "amlaccid": "9063500632",
            "accno": "4147342080775721",
            "accnm": "SURESH KUMAR SADASIVAN NAIR",
            "accopendate": "2019-02-19",
            "accptyrolecd": "BOR",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "7326402365",
          "v_type": "gfctPhone",
          "attributes": {
            "phonenumber": "7326402365",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "7326738930",
          "v_type": "gfctPhone",
          "attributes": {
            "phonenumber": "7326738930",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "5016402366",
          "v_type": "gfctPhone",
          "attributes": {
            "phonenumber": "5016402366",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "ap@globallines.com",
          "v_type": "gfctEmail",
          "attributes": {
            "emailaddress": "ap@globallines.com",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "unknown@whoami.com",
          "v_type": "gfctEmail",
          "attributes": {
            "emailaddress": "unknown@whoami.com",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "9137353862",
          "v_type": "gfctAccount",
          "attributes": {
            "amlaccid": "9137353862",
            "accno": "4147342071409745",
            "accnm": "SURESH SADASIVAN NAIR",
            "accopendate": "2019-09-09",
            "accptyrolecd": "BOR",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "9063500633",
          "v_type": "gfctAccount",
          "attributes": {
            "amlaccid": "9063500633",
            "accno": "4147342080775722",
            "accnm": "SURESH SADASIVAN NAIR",
            "accopendate": "2019-05-29",
            "accptyrolecd": "BOR",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        },
        {
          "v_id": "9063500044",
          "v_type": "gfctAccount",
          "attributes": {
            "amlaccid": "9063500044",
            "accno": "4147342080770833",
            "accnm": "SID TOMAR",
            "accopendate": "2019-05-29",
            "accptyrolecd": "BOR",
            "flucd": "CNS_RTL_BNK",
            "fludescription": "Consumer Retail Banking",
            "isskewed": "false",
            "@visited": true
          }
        }
      ]
    },
    {
      "@@edgeSet": [
        {
          "e_type": "contains",
          "from_id": "302190803",
          "from_type": "gfctParty",
          "to_type": "gfctEntity",
          "to_id": "90098302633",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "contains",
          "from_id": "90098302633",
          "from_type": "gfctEntity",
          "to_type": "gfctCase",
          "to_id": "AML-2021040158769",
          "directed": false,
          "attributes": {}
        },
        // {
        //   "e_type": "contains",
        //   "from_id": "90098302633",
        //   "from_type": "gfctEntity",
        //   "to_type": "gfctParty",
        //   "to_id": "302190803",
        //   "directed": false,
        //   "attributes": {}
        // },
        {
          "e_type": "contains",
          "from_id": "90098302744",
          "from_type": "gfctEntity",
          "to_type": "gfctParty",
          "to_id": "302190704",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "contains",
          "from_id": "90098302633",
          "from_type": "gfctEntity",
          "to_type": "gfctParty",
          "to_id": "302190804",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "contains",
          "from_id": "302190804",
          "from_type": "gfctParty",
          "to_type": "gfctEntity",
          "to_id": "90098302633",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_email",
          "from_id": "90098302633",
          "from_type": "gfctEntity",
          "to_type": "gfctEmail",
          "to_id": "unknown@whoami.com",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_email",
          "from_id": "302190704",
          "from_type": "gfctParty",
          "to_type": "gfctEmail",
          "to_id": "unknown@whoami.com",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_email",
          "from_id": "302190704",
          "from_type": "gfctParty",
          "to_type": "gfctPhone",
          "to_id": "7326738930",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_acct",
          "from_id": "302190803",
          "from_type": "gfctParty",
          "to_type": "gfctAccount",
          "to_id": "9137353861",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_acct",
          "from_id": "302190803",
          "from_type": "gfctParty",
          "to_type": "gfctAccount",
          "to_id": "9063500632",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_address",
          "from_id": "302190803",
          "from_type": "gfctParty",
          "to_type": "gfctAddress",
          "to_id": "140 ETHEL RD W STE S 08854, PISCATAWAY, NJ, US",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_ssn",
          "from_id": "302190803",
          "from_type": "gfctParty",
          "to_type": "gfctSSN",
          "to_id": "150347655",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_ssn",
          "from_id": "302190704",
          "from_type": "gfctParty",
          "to_type": "gfctSSN",
          "to_id": "834527376",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_ein",
          "from_id": "302190704",
          "from_type": "gfctParty",
          "to_type": "gfctEin",
          "to_id": "564738",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_ssn",
          "from_id": "302190804",
          "from_type": "gfctParty",
          "to_type": "gfctSSN",
          "to_id": "150347655",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_phone",
          "from_id": "302190803",
          "from_type": "gfctParty",
          "to_type": "gfctPhone",
          "to_id": "7326402365",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_phone",
          "from_id": "302190804",
          "from_type": "gfctParty",
          "to_type": "gfctPhone",
          "to_id": "5016402366",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_email",
          "from_id": "302190803",
          "from_type": "gfctParty",
          "to_type": "gfctEmail",
          "to_id": "ap@globallines.com",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_acct",
          "from_id": "302190804",
          "from_type": "gfctParty",
          "to_type": "gfctAccount",
          "to_id": "9137353862",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_acct",
          "from_id": "302190804",
          "from_type": "gfctParty",
          "to_type": "gfctAccount",
          "to_id": "9063500633",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_acct",
          "from_id": "302190704",
          "from_type": "gfctParty",
          "to_type": "gfctAccount",
          "to_id": "9063500044",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_address",
          "from_id": "302190704",
          "from_type": "gfctParty",
          "to_type": "gfctAddress",
          "to_id": "140 LINCKON ST 08821, FREEHOLD, NJ, US",
          "directed": false,
          "attributes": {}
        },
        {
          "e_type": "has_acct",
          "from_id": "90098924561",
          "from_type": "gfctEntity",
          "to_type": "gfctAccount",
          "to_id": "9063500633",
          "directed": false,
          "attributes": {}
        }
      ]
    }
  ]
};

export function onNumHopChange(numHop: number | undefined) { 
    console.log("Num Hops changed");
};