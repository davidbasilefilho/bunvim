export const queries: Record<string, string> = {
	typescript: `
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration (identifier) @function)
    (call_expression function: (identifier) @function)
    (class_declaration (type_identifier) @type)
    (interface_declaration (type_identifier) @type)
    (type_alias_declaration (type_identifier) @type)
    (property_identifier) @property
    (property_signature (property_identifier) @property)
    (shorthand_property_identifier_pattern) @property
    (this) @variable.builtin
    (super) @variable.builtin
    
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
      "typeof"
      "instanceof"
      "in"
      "of"
      "as"
      "async"
      "await"
    ] @keyword

    (identifier) @variable
  `,
	javascript: `
    (identifier) @variable
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration (identifier) @function)
    (call_expression function: (identifier) @function)
    (class_declaration (identifier) @type)
    (property_identifier) @property
    (this) @variable.builtin
    (super) @variable.builtin

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
      "typeof"
      "instanceof"
      "in"
      "of"
      "async"
      "await"
    ] @keyword
  `,
	tsx: `
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration (identifier) @function)
    (call_expression function: (identifier) @function)
    (class_declaration (type_identifier) @type)
    (interface_declaration (type_identifier) @type)
    (type_alias_declaration (type_identifier) @type)
    (jsx_opening_element (identifier) @type)
    (jsx_closing_element (identifier) @type)
    (jsx_attribute (property_identifier) @variable)
    (property_identifier) @property
    (property_signature (property_identifier) @property)
    (shorthand_property_identifier_pattern) @property
    (this) @variable.builtin
    (super) @variable.builtin

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
      "typeof"
      "instanceof"
      "in"
      "of"
      "as"
      "async"
      "await"
    ] @keyword

    (identifier) @variable
  `,
	json: `
    (string) @string
    (number) @constant
    (pair key: (string) @variable)
  `,
	rust: `
    (identifier) @variable
    (type_identifier) @type
    (primitive_type) @type
    (string_literal) @string
    (integer_literal) @constant
    (boolean_literal) @constant
    (comment) @comment
    (line_comment) @comment
    (block_comment) @comment
    (function_item (identifier) @function)
    (call_expression (identifier) @function)
    (field_expression field: (field_identifier) @variable)
    (struct_expression (type_identifier) @type)
    
    [
      "if" "else" "for" "while" "loop" "match" "return" "break" "continue"
      "let" "mut" "const" "static" "fn" "struct" "enum" "trait" "impl" "type"
      "mod" "use" "pub" "crate" "self" "super" "extern" "unsafe" "async" "await"
      "in" "as" "where" "dyn" "move"
    ] @keyword
  `,
	go: `
    (identifier) @variable
    (type_identifier) @type
    (string_literal) @string
    (interpreted_string_literal) @string
    (raw_string_literal) @string
    (int_literal) @constant
    (float_literal) @constant
    (comment) @comment
    (function_declaration (identifier) @function)
    (method_declaration (field_identifier) @function)
    (call_expression (identifier) @function)
    
    [
      "if" "else" "for" "range" "switch" "case" "default" "select" "return" "break" "continue" "fallthrough" "goto"
      "var" "const" "type" "func" "struct" "interface" "map" "chan" "package" "import" "go" "defer"
    ] @keyword
  `,
	python: `
    (identifier) @variable
    (string) @string
    (integer) @constant
    (float) @constant
    (comment) @comment
    (function_definition (identifier) @function)
    (call (identifier) @function)
    (attribute (identifier) @variable)
    (class_definition (identifier) @type)
    
    [
      "if" "else" "elif" "for" "while" "try" "except" "finally" "with" "as" "assert" "import" "from" "global" "nonlocal" "return" "yield" "break" "continue" "pass" "raise"
      "def" "class" "lambda" "async" "await" "in" "is" "not" "and" "or"
    ] @keyword
  `,
	lua: `
    (identifier) @variable
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration (identifier) @function)
    (function_call (identifier) @function)
    
    [
      "if" "then" "else" "elseif" "end" "for" "while" "repeat" "until" "do" "return" "break"
      "local" "function" "in" "and" "or" "not" "nil" "true" "false"
    ] @keyword
  `,
	cpp: `
    (identifier) @variable
    (type_identifier) @type
    (string_literal) @string
    (number_literal) @constant
    (comment) @comment
    (function_definition (field_identifier) @function)
    (call_expression (identifier) @function)
    (primitive_type) @type
    
    [
      "if" "else" "for" "while" "do" "switch" "case" "default" "return" "break" "continue" "goto" "try" "catch" "throw"
      "class" "struct" "enum" "union" "template" "typename" "namespace" "using" "public" "private" "protected" "virtual" "override" "final" "static" "const" "volatile" "mutable" "inline" "extern" "friend" "new" "delete" "sizeof" "typeid" "explicit" "operator" "this" "decltype" "auto" "nullptr"
    ] @keyword
  `,
	c: `
    (identifier) @variable
    (type_identifier) @type
    (string_literal) @string
    (number_literal) @constant
    (comment) @comment
    (primitive_type) @type
    
    [
      "if" "else" "for" "while" "do" "switch" "case" "default" "return" "break" "continue" "goto"
      "struct" "enum" "union" "typedef" "static" "const" "volatile" "extern" "inline" "sizeof" "void"
    ] @keyword
  `,
	yaml: `
    (key) @variable
    (string_scalar) @string
    (integer_scalar) @constant
    (boolean_scalar) @constant
    (comment) @comment
  `,
	toml: `
    (key) @variable
    (string) @string
    (integer) @constant
    (boolean) @constant
    (comment) @comment
    (table_array (bare_key) @type)
    (table (bare_key) @type)
  `,
	html: `

    (tag_name) @type
    (attribute_name) @variable
    (attribute_value) @string
    (comment) @comment
    (entity) @constant
    (text) @fg
  `,
	css: `
    (property_name) @variable
    (number_value) @constant
    (unit) @keyword
    (color_value) @constant
    (string_value) @string
    (comment) @comment
    (tag_name) @type
    (class_name) @type
    (id_name) @type
  `,
	bash: `
    (variable_name) @variable
    (string) @string
    (raw_string) @string
    (comment) @comment
    (command_name) @function
    
    [
      "if" "then" "else" "elif" "fi" "case" "esac" "for" "while" "until" "do" "done" "in"
      "function" "return" "exit" "break" "continue"
    ] @keyword
  `,
};
