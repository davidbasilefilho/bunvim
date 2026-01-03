export const queries: Record<string, string> = {
	typescript: `
    (identifier) @variable
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration name: (identifier) @function)
    (call_expression function: (identifier) @function)
    (class_declaration name: (identifier) @type)
    (interface_declaration name: (identifier) @type)
    (type_alias_declaration name: (identifier) @type)
    
    [
      "if"
      "else"
      "for"
      "while"
      "do"
      "switch"
      "case"
      "default"
      "break"
      "continue"
      "return"
      "try"
      "catch"
      "finally"
      "throw"
      "import"
      "export"
      "from"
      "const"
      "let"
      "var"
      "function"
      "class"
      "interface"
      "type"
      "enum"
      "extends"
      "implements"
      "new"
      "this"
      "super"
      "typeof"
      "instanceof"
      "in"
      "of"
      "as"
      "async"
      "await"
    ] @keyword
  `,
	javascript: `
    (identifier) @variable
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration name: (identifier) @function)
    (call_expression function: (identifier) @function)
    (class_declaration name: (identifier) @type)

    [
      "if"
      "else"
      "for"
      "while"
      "do"
      "switch"
      "case"
      "default"
      "break"
      "continue"
      "return"
      "try"
      "catch"
      "finally"
      "throw"
      "import"
      "export"
      "from"
      "const"
      "let"
      "var"
      "function"
      "class"
      "extends"
      "new"
      "this"
      "super"
      "typeof"
      "instanceof"
      "in"
      "of"
      "as"
      "async"
      "await"
    ] @keyword
  `,
	tsx: `
    (identifier) @variable
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration name: (identifier) @function)
    (call_expression function: (identifier) @function)
    (class_declaration name: (identifier) @type)
    (interface_declaration name: (identifier) @type)
    (type_alias_declaration name: (identifier) @type)
    (jsx_opening_element name: (_) @type)
    (jsx_closing_element name: (_) @type)
    (jsx_attribute (property_identifier) @variable)

    [
      "if"
      "else"
      "for"
      "while"
      "do"
      "switch"
      "case"
      "default"
      "break"
      "continue"
      "return"
      "try"
      "catch"
      "finally"
      "throw"
      "import"
      "export"
      "from"
      "const"
      "let"
      "var"
      "function"
      "class"
      "interface"
      "type"
      "enum"
      "extends"
      "implements"
      "new"
      "this"
      "super"
      "typeof"
      "instanceof"
      "in"
      "of"
      "as"
      "async"
      "await"
    ] @keyword
  `,
	json: `
    (string) @string
    (number) @constant
    (pair key: (string) @variable)
  `,
};
