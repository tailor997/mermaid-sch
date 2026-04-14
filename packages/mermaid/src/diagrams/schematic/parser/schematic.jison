/** mermaid
 *  https://knsv.github.io/mermaid
 *  (c) 2015 Knut Sveidqvist
 *  MIT license.
 */
%lex

%options case-insensitive

%{
	// Pre-lexer code can go here
%}
%x PAGE_SETTING
%x TITLE_BLOCK

%%

[ \t]*\%\%.*       {yy.getLogger().trace('Found comment',yytext); return 'SPACELINE';}
[ \t]*\#.*         {yy.getLogger().trace('Found comment',yytext); return 'SPACELINE';}
"schematic"         return 'SCHEMATIC';
"LR"                return 'LR';
"TB"                return 'TB';
"BT"                return 'BT';
"RL"                return 'RL';
"subgraph"           return 'SUBGRAPH';
"end"                return 'END';
"symbol@"            return 'SYMBOL_AT';
"symbol"             return 'SYMBOL';
"pin"                return 'PIN';
"part"               return 'PART';
"component"          return 'COMPONENT';
"electrical"         return 'ELECTRICAL';
"symbol_shape"       return 'SYMBOL_SHAPE';
"name"               return 'NAME';
"footprint"          return 'FOOTPRINT';
"desc"               return 'DESC';
"manufacturer"       return 'MANUFACTURER';
"shape"              return 'SHAPE';
"value"              return 'VALUE';
"id"                 return 'ID';
"type"               return 'TYPE';
"num"                { return 'NUM'; }
"pins"               return 'PINS';
"voltage"            return 'VOLTAGE';
"max_freq"           return 'MAX_FREQ';
"styleClass"         return 'STYLECLASS';

"(--)"              return 'DOUBLE_ARROW';
"["                 return 'LBRACK';
"]"                 return 'RBRACK';
"("                 return 'LPAREN';
")"                 return 'RPAREN';
"{"                 return 'LCURLY';
"}"                 return 'RCURLY';
"<"                 return 'LT';
">"                 return 'GT';
"."                 return 'DOT';
":"                 return 'COLON';
","                 return 'COMMA';
"="                 return 'EQUALS';
"<--"               return 'LEFT_ARROW';
"-->"               return 'RIGHT_ARROW';

"page_setting"       { this.begin('PAGE_SETTING'); return 'PAGE_SETTING'; }
"title_block"        { this.begin('TITLE_BLOCK'); return 'TITLE_BLOCK'; }

<PAGE_SETTING,TITLE_BLOCK>\s+         /* skip whitespace */
<PAGE_SETTING,TITLE_BLOCK>\n+         /* skip newlines */
<PAGE_SETTING,TITLE_BLOCK>"{"         return 'LCURLY';
<PAGE_SETTING,TITLE_BLOCK>"}"         { this.popState(); return 'RCURLY'; }
<PAGE_SETTING,TITLE_BLOCK>","         return 'COMMA';
<PAGE_SETTING,TITLE_BLOCK>":"         return 'COLON';
<PAGE_SETTING,TITLE_BLOCK>"\""[^"]*"\"" { yytext = yytext.substring(1, yytext.length - 1); return 'STRING'; }

<PAGE_SETTING>"paper-dir"  return 'PAPER_DIR';
<PAGE_SETTING>"paper"      return 'PAPER';
<PAGE_SETTING>"scale"      return 'SCALE';
<PAGE_SETTING>"dpi"        return 'DPI';
<PAGE_SETTING>"width"      return 'WIDTH';
<PAGE_SETTING>"height"     return 'HEIGHT';

<TITLE_BLOCK>"title"       return 'TITLE';
<TITLE_BLOCK>"date"        return 'DATE';
<TITLE_BLOCK>"rev"         return 'REV';
<TITLE_BLOCK>"company"     return 'COMPANY';
<TITLE_BLOCK>"comment"     return 'COMMENT';

<PAGE_SETTING,TITLE_BLOCK>[a-zA-Z0-9_\-\.]+ return 'IDENTIFIER';

[ \t\r]+              /* skip whitespace */
\n+                 return 'NL';

[0-9]+[a-zA-Z_][a-zA-Z0-9_\-+]* { return 'IDENTIFIER'; }
[0-9]+       { yytext = parseInt(yytext); return 'NUMBER'; }
[a-zA-Z_][a-zA-Z0-9_\-+]* { return 'IDENTIFIER'; }
"\""[^"]*"\""      { yytext = yytext.substring(1, yytext.length - 1); return 'STRING'; }
"'"[^']*"'"            { yytext = yytext.substring(1, yytext.length - 1); return 'STRING'; }
<<EOF>>              return 'EOF';

/lex

%start start

%% /* language grammar */

start
  : SCHEMATIC layout_opt NL document EOF { return yy; }
  | SCHEMATIC NL document EOF { return yy; }
  ;

layout_opt
  : LR
  | TB
  | BT
  | RL
  ;

document
  : document statement
  | statement
  ;

statement
  : subgraph
  | page_setting
  | title_block
  | symbol_definition
  | component_instantiation
  | component_reference
  | connection
  | SPACELINE
  | NL
  ;

connection
  : connectable DOUBLE_ARROW connectable {
      var source = $1;
      var target = $3;
      yy.addConnection(source.id, target.id, source.pin, target.pin);
      $$ = target;
    }
  | connectable DOUBLE_ARROW connection {
      var source = $1;
      var target = $3;
      yy.addConnection(source.id, target.id, source.pin, target.pin);
      $$ = source;
    }
  ;

connectable
  : LPAREN IDENTIFIER RPAREN { $$ = { id: $2, pin: undefined }; }
  | LPAREN NUMBER RPAREN { $$ = { id: $2, pin: undefined }; }
  | LBRACK IDENTIFIER RBRACK { $$ = { id: $2, pin: undefined }; }
  | LBRACK NUMBER RBRACK { $$ = { id: $2, pin: undefined }; }
  | LBRACK IDENTIFIER RBRACK DOT LPAREN IDENTIFIER RPAREN { $$ = { id: $2, pin: $6 }; }
  | LBRACK IDENTIFIER RBRACK DOT LPAREN NUMBER RPAREN { $$ = { id: $2, pin: $6 }; }
  | LBRACK NUMBER RBRACK DOT LPAREN IDENTIFIER RPAREN { $$ = { id: $2, pin: $6 }; }
  | LBRACK NUMBER RBRACK DOT LPAREN NUMBER RPAREN { $$ = { id: $2, pin: $6 }; }
  | LPAREN IDENTIFIER RPAREN DOT LBRACK IDENTIFIER RBRACK { $$ = { id: $6, pin: $2 }; }
  | LPAREN IDENTIFIER RPAREN DOT LBRACK NUMBER RBRACK { $$ = { id: $6, pin: $2 }; }
  | LPAREN NUMBER RPAREN DOT LBRACK IDENTIFIER RBRACK { $$ = { id: $6, pin: $2 }; }
  | LPAREN NUMBER RPAREN DOT LBRACK NUMBER RBRACK { $$ = { id: $6, pin: $2 }; }
  ;

component_instantiation
  : LBRACK IDENTIFIER IDENTIFIER RBRACK attributes_opt {
      yy.addSymbol({ name: $2, id: $3, pinGroups: [], electrical: $5 });
  }
  ;

symbol_definition
  : SYMBOL_AT IDENTIFIER LCURLY symbol_body RCURLY {
      yy.addSymbolDefinition($2, $4);
    }
  ;

symbol_body
  : symbol_properties {
      $$ = $1;
    }
  | symbol_properties pin_definitions {
      $$ = Object.assign({}, $1, { pins: $2 });
    }
  | symbol_properties pin_definitions NL {
      $$ = Object.assign({}, $1, { pins: $2 });
    }
  ;

symbol_properties
  : /* empty */ { $$ = {}; }
  | symbol_properties NL { $$ = $1; }
  | symbol_properties symbol_property { $$ = Object.assign({}, $1, $2); }
  | symbol_properties symbol_property COMMA { $$ = Object.assign({}, $1, $2); }
  ;

symbol_property
  : NAME COLON STRING { $$ = { name: $3 }; }
  | FOOTPRINT COLON STRING { $$ = { footprint: $3 }; }
  | FOOTPRINT COLON IDENTIFIER { $$ = { footprint: $3 }; }
  | DESC COLON STRING { $$ = { desc: $3 }; }
  | MANUFACTURER COLON STRING { $$ = { manufacturer: $3 }; }
  | VOLTAGE COLON STRING { $$ = { voltage: $3 }; }
  | MAX_FREQ COLON STRING { $$ = { maxFreq: $3 }; }
  | SHAPE COLON STRING { $$ = { shape: $3 }; }
  | SHAPE COLON IDENTIFIER { $$ = { shape: $3 }; }
  | STYLECLASS COLON STRING { $$ = { styleClass: $3 }; }
  | STYLECLASS COLON IDENTIFIER { $$ = { styleClass: $3 }; }
  ;

pin_definitions
  : PINS COLON LBRACK pin_list RBRACK { $$ = $4; }
  | PINS COLON LBRACK NL pin_list RBRACK { $$ = $5; }
  ;

pin_list
  : pin_item { $$ = [$1]; }
  | pin_list NL { $$ = $1; }
  | pin_list COMMA NL pin_item { $$ = $1.concat([$4]); }
  | pin_list COMMA pin_item { $$ = $1.concat([$3]); }
  ;

pin_item
  : LCURLY pin_properties RCURLY { $$ = $2; }
  | LCURLY NL pin_properties NL RCURLY { $$ = $3; }
  ;

pin_properties
  : pin_property { $$ = $1; }
  | pin_properties COMMA pin_property { $$ = Object.assign({}, $1, $3); }
  | pin_properties COMMA NL pin_property { $$ = Object.assign({}, $1, $4); }
  ;

pin_property
  : NUM COLON NUMBER { $$ = { num: $3 }; }
  | NAME COLON STRING { $$ = { name: $3 }; }
  | NAME COLON IDENTIFIER { $$ = { name: $3 }; }
  | TYPE COLON STRING { $$ = { type: $3 }; }
  | TYPE COLON IDENTIFIER { $$ = { type: $3 }; }
  | DESC COLON STRING { $$ = { desc: $3 }; }
  ;

component_reference
  : LBRACK COMPONENT IDENTIFIER IDENTIFIER RBRACK attributes_opt {
      yy.addComponentReference($3, $4, $6);
    }
  ;

attributes_opt
  : /* empty */ { $$ = {}; }
  | LCURLY attributes RCURLY { $$ = $2; }
  ;

attributes
  : attribute { $$ = $1; }
  | attributes COMMA attribute { $$ = Object.assign({}, $1, $3); }
  ;

attribute
  : IDENTIFIER COLON attribute_value { 
      var val = $3;
      if (!isNaN(Number(val))) {
        val = Number(val);
      }
      var obj = {};
      obj[$1] = val;
      $$ = obj;
    }
  ;

attribute_value
  : STRING
  | IDENTIFIER
  | NUMBER
  ;

subgraph
  : subgraph_head document END
  ;

subgraph_head
  : SUBGRAPH IDENTIFIER LBRACK STRING RBRACK { yy.addPage($2, $4); }
  ;

page_setting
  : PAGE_SETTING LCURLY page_setting_items RCURLY { 
      yy.setPageSetting($3); 
    }
  ;

page_setting_items
  : page_setting_item { $$ = $1; }
  | page_setting_items COMMA page_setting_item { $$ = Object.assign({}, $1, $3); }
  ;

page_setting_item
  : PAPER COLON page_setting_value { 
      $$ = { paper: $3 }; 
    }
  | PAPER_DIR COLON page_setting_value { 
      $$ = { paperDir: $3 }; 
    }
  | SCALE COLON page_setting_value { 
      $$ = { scale: parseFloat($3) }; 
    }
  | DPI COLON page_setting_value { 
      $$ = { dpi: parseInt($3) }; 
    }
  | WIDTH COLON page_setting_value { 
      $$ = { width: parseInt($3) }; 
    }
  | HEIGHT COLON page_setting_value { 
      $$ = { height: parseInt($3) }; 
    }
  ;

page_setting_value
  : STRING
  | IDENTIFIER
  ;

title_block
  : TITLE_BLOCK LCURLY title_block_items RCURLY { 
      yy.setTitleBlock($3); 
    }
  ;

title_block_items
  : title_block_item { $$ = $1; }
  | title_block_items COMMA title_block_item { $$ = Object.assign({}, $1, $3); }
  ;

title_block_item
  : TITLE COLON title_block_value { 
      $$ = { title: $3 }; 
    }
  | DATE COLON title_block_value { 
      $$ = { date: $3 }; 
    }
  | REV COLON title_block_value { 
      $$ = { rev: $3 }; 
    }
  | COMPANY COLON title_block_value { 
      $$ = { company: $3 }; 
    }
  | COMMENT COLON title_block_value { 
      $$ = { comment: $3 }; 
    }
  ;

title_block_value
  : STRING
  | IDENTIFIER
  ;
