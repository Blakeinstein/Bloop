// @ts-ignore
ace.define("ace/mode/bloop", [], function (require, exports, module) {
  var oop = require("ace/lib/oop");
  var TextMode = require("ace/mode/text").Mode;
  var Tokenizer = require("ace/tokenizer").Tokenizer;
  var BloopHighlight = require("ace/mode/bloop_highlight").BloopHighlight;

  var Mode = function () {
    this.HighlightRules = BloopHighlight;
  };
  oop.inherits(Mode, TextMode);

  (function () {
    this.lineCommentStart = "--";
    this.blockComment = { start: "->", end: "<-" };
  }.call(Mode.prototype));

  exports.Mode = Mode;
});
// @ts-ignore
ace.define("ace/mode/bloop_highlight", [], function (require, exports, module) {
  var oop = require("ace/lib/oop");
  var TextHighlightRules =
    require("ace/mode/text_highlight_rules").TextHighlightRules;

  var BloopHighlight = function () {
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
          regex: `["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)`,
          token: "extra",
        },
        // XML-like tags
        {
          regex: `${quoteLookahead}<(?:.*?)\\b[^>]*\\/?>`,
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
          )})${standaloneSuffix}`,
          token: "attribute",
        },
        {
          regex: `${standalonePrefix}(${moreAttributes.join(
            "|"
          )})${standaloneSuffix}`,
          caseInsensitive: true,
          token: "keyword",
        },
        {
          regex: `(?:^)(${commonAttributes.join("|")})${standaloneSuffix}`,
          caseInsensitive: true,
          sol: true,
          token: "attribute",
        },
        {
          regex: `(?:^)(${moreAttributes.join("|")})${standaloneSuffix}`,
          caseInsensitive: true,
          sol: true,
          token: "keyword",
        },
        // Strings
        {
          token: "string", // single line
          regex: `"""|'''|\``,
          next: "string",
        },
        {
          regex: `("|')(?:(?!\\1)(?:\\\\.|[^\\\\]))*\\1`,
          token: "string",
        },
        // Comments
        {
          regex: `${quoteLookahead}//(.*)`,
          token: "extra",
        },
        {
          regex: `${quoteLookahead}\/\\*`,
          caseInsensitive: true,
          token: "comment",
          next: "comment",
        },
        {
          regex: `${quoteLookahead}<!--`,
          caseInsensitive: true,
          token: "comment",
          next: "comment",
        },
      ],
      string: [
        {
          token: "attribute",
          regex: /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|["\\\/bfnrt])/,
        },
        {
          token: "string",
          regex: `"""|'''|\``,
          next: "start",
        },
        {
          defaultToken: "string",
        },
      ],
      comment: [
        {
          token: "comment", // comments are not allowed, but who cares?
          regex: "\\*/",
          next: "start",
        },
        {
          token: "comment", // comments are not allowed, but who cares?
          regex: "-\\->",
          next: "start",
        },
        {
          defaultToken: "comment",
        },
      ],
    };
    this.normalizeRules();
  };

  oop.inherits(BloopHighlight, TextHighlightRules);

  exports.BloopHighlight = BloopHighlight;
});
