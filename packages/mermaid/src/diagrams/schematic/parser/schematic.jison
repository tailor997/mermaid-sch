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

[a-zA-Z0-9_\-\+]+      return 'IDENTIFIER';
"\""[^"]*"\""      { yytext = yytext.substring(1, yytext.length - 1); return 'STRING'; }
"'[^']+'"            { yytext = yytext.substring(1, yytext.length - 1); return 'STRING'; }
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
  | component_instantiation
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
  | LBRACK IDENTIFIER RBRACK { $$ = { id: $2, pin: undefined }; }
  | LBRACK IDENTIFIER RBRACK DOT LPAREN IDENTIFIER RPAREN { $$ = { id: $2, pin: $6 }; }
  | LPAREN IDENTIFIER RPAREN DOT LBRACK IDENTIFIER RBRACK { $$ = { id: $6, pin: $2 }; }
  ;

component_instantiation
  : LBRACK IDENTIFIER IDENTIFIER RBRACK attributes_opt {
      yy.addSymbol({ name: $2, id: $3, pinGroups: [], electrical: $5 });
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
