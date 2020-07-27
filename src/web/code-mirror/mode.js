(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
      mod(require("codemirror/lib/codemirror"), require("codemirror/addon/mode/simple"));
    else if (typeof define == "function" && define.amd) // AMD
      define(["../../lib/codemirror", "../../addon/mode/simple"], mod);
    else // Plain browser env
      mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";
  
    var commonAttributes = ["var", "val", "let", "if", "else", "export", "import", "return", "static", "fun", "function", "func", "class", "open", "new", "as", "where", "select", "delete", "add", "limit", "update", "insert"]
    
    var moreAttributes = ["true", "false", "to", "string", "int", "float", "double", "bool", "boolean", "from"]

    let standalonePrefix = "(?<=[\\s]|^|[\\(,:])"

    let standaloneSuffix = "(?=[\\s\\?\\!,:\\)\\();]|$)"
    
    let quoteLookahead = "(?=(?:(?:[^\"]*\"){2})*[^\"]*$)"
    
    let quotes = "(\"|@\")(?:[^\"\\\\\\n]|\\\\.)*[^\"\\n]*(@\"|\")"
    
    let number = "\\b(?:0x[a-f0-9]+|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)(?:e[+\\-]?\\d+)?)\\b"
  
    let UTCDate = "(?:(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\\s+)?(0[1-9]|[1-2]?[0-9]|3[01])\\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\\s+(19[0-9]{2}|[2-9][0-9]{3})\\s+(2[0-3]|[0-1][0-9]):([0-5][0-9])(?::(60|[0-5][0-9]))?\\s+([-\\+][0-9]{2}[0-5][0-9]|(?:UT|GMT|(?:E|C|M|P)(?:ST|DT)|[A-IK-Z]))"
  
    CodeMirror.defineSimpleMode("bloop", {
      start: [
        // Extras

        //UTC date
        {
          regex: new RegExp(standalonePrefix+"("+UTCDate+")"+standaloneSuffix),
          token: "number"
        },
        // MD5 strings
        {
          regex: new RegExp(standalonePrefix+"([a-f0-9]{32})"+standaloneSuffix),
          token: "keyword"
        },
        // Match JSON labels and generic parameters
        {
          regex: new RegExp(quoteLookahead+"(?=(?:[ {\\[]*))([^\\r\\n:\\s\\w]+?|"+quotes+")\\s*(?=\\:(?!\\:))", "m"),
          token: "extra"
        },
        // XML-like tags
        {
          regex: new RegExp(+quoteLookahead+"<(?:.*?)\\b[^>]*\\/?>", "m"),
          token: "attribute"
        },

        //regulars

        {
          regex: new RegExp(number),
          token: "number"
        },
        // common attributes
        {
          regex: new RegExp(standalonePrefix+"("+commonAttributes.join("|")+")"+standaloneSuffix, "i"),
          token: "attribute"
        },
        {
          regex: new RegExp(standalonePrefix+"("+moreAttributes.join("|")+")"+standaloneSuffix, "i"),
          token: "keyword"
        },
        
        // Strings
        {
          regex: new RegExp(quotes, "is"),
          token: "string"
        },
        {
          regex: new RegExp("`(?:[^`\\\\\\n]|\\\\.)*[^`\\n]*`", "is"),
          token: "string"
        },
        {
          regex: new RegExp("'(?:[^\'\\\\\\n]|\\\\.)*[^\'\\n]*'", "is"),
          token: "string"
        },
        {
          regex: new RegExp("(\"\"\")(.*?)(\"\"\")", "is"),
          token: "string"
        },

        // Comments
        {
          regex: new RegExp(quoteLookahead+"//(.*)"),
          token: "extra"
        },
        {
          regex: new RegExp(quoteLookahead+"/\\*.*?\\*/", "is"),
          token: "comment"
        },
        {
          regex: new RegExp(quoteLookahead+"<\\!--[\\s\\S]*?(?:-\\->|$)", "is"),
          token: "comment"
        }
      ],
    });
  
    CodeMirror.defineMIME("text/x-blooptext", "bloop");
  });