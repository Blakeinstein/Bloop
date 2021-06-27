import "ace-builds/src-min-noconflict/mode-text";

// @ts-ignore
ace.define(
  "ace/mode/bloop",
  [
    "require",
    "exports",
    "module",
    "ace/config",
    "ace/lib/oop",
    "ace/mode/text_highlight_rules",
  ],
  function (require, exports, module) {
    "use strict";

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text").HighlightRules;

    let commonAttributes = [
      "var",
      "val",
      "let",
      "if",
      "else",
      "export",
      "import",
      "return",
      "static",
      "fun",
      "function",
      "func",
      "class",
      "open",
      "new",
      "as",
      "where",
      "select",
      "delete",
      "add",
      "limit",
      "update",
      "insert",
    ];

    let moreAttributes = [
      "true",
      "false",
      "to",
      "string",
      "int",
      "float",
      "double",
      "bool",
      "boolean",
      "from",
    ];

    let standalonePrefix = "(?:[\\s]|[\\(,:])";

    let standaloneSuffix = "(?=[\\s\\?\\!,:\\)\\();]|$)";

    let quoteLookahead = '(?=(?:(?:[^"]*"){2})*[^"]*$)';

    let quotes = '("|@")(?:[^"\\\\\\n]|\\\\.)*[^"\\n]*(@"|")';

    let number =
      "\\b(?:0x[a-f0-9]+|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)(?:e[+\\-]?\\d+)?)\\b";

    let UTCDate =
      "(?:(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\\s+)?(0[1-9]|[1-2]?[0-9]|3[01])\\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+(19[0-9]{2}|[2-9][0-9]{3})\\s+(2[0-3]|[0-1][0-9]):([0-5][0-9])(?::(60|[0-5][0-9]))?\\s+([-\\+][0-9]{2}[0-5][0-9]|(?:UT|GMT|(?:E|C|M|P)(?:ST|DT)|[A-IK-Z]))";

    var BloopHighlightRules = function () {
      this.$rules = {
        start: [
          {
            regex: `${standalonePrefix}(${UTCDate})${standaloneSuffix}`,
            token: "number",
          },
          {
            regex: `(?:^)(${UTCDate})${standaloneSuffix}`,
            sol: true,
            token: "number",
          },
          // MD5 strings
          {
            regex: `${standalonePrefix}([a-f0-9]{32})${standaloneSuffix}`,
            token: "keyword",
          },
          {
            regex: `(?:^)([a-f0-9]{32})${standaloneSuffix}`,
            token: "keyword",
          },
          // Match JSON labelss and generic parameters
          {
            regex: `${quoteLookahead}(?=(?:[ {\\[]*))([^\\r\\n:\\s\\w]+?|"${quotes})\\s*(?=\\:(?!\\:))\m`,
            token: "extra",
          },
          // XML-like tags
          {
            regex: `${quoteLookahead}<(?:.*?)\\b[^>]*\\/?>\m`,
            token: "attribute",
          },
          //regulars
          {
            regex: number,
            token: "number",
          },
          // common attributes
          {
            regex: `${standalonePrefix}(${commonAttributes.join(
              "|"
            )})${standaloneSuffix}\i`,
            token: "attribute",
          },
          {
            regex: `${standalonePrefix}(${moreAttributes.join(
              "|"
            )})${standaloneSuffix}\i`,
            token: "keyword",
          },
          {
            regex: `(?:^)(${commonAttributes.join("|")})${standaloneSuffix}\i`,
            sol: true,
            token: "attribute",
          },
          {
            regex: `(?:^)(${moreAttributes.join("|")})${standaloneSuffix}\i`,
            sol: true,
            token: "keyword",
          },
          // Strings
          {
            regex: `(\"\"\"|'''|\"|')(?:(?!\\1)(?:\\\\.|[^\\\\]))*\\1\m`,
            token: "string",
          },
          // Comments
          {
            regex: `${quoteLookahead}//(.*)`,
            token: "extra",
          },
        ],
      };
      this.normalizeRules();
    };

    oop.inherits(BloopHighlightRules, TextHighlightRules);
    exports.BloopHighlightRules = BloopHighlightRules;
  }
);
