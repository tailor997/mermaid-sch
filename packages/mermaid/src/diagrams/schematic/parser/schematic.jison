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

\s*\%\%.*          {yy.getLogger().trace('Found comment',yytext); return 'SPACELINE';}
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
"<-->"              return 'DOUBLE_ARROW';

"page_setting"       { this.begin('PAGE_SETTING'); return 'PAGE_SETTING'; }
"title_block"        { this.begin('TITLE_BLOCK'); return 'TITLE_BLOCK'; }

<PAGE_SETTING,TITLE_BLOCK>\s+         /* skip whitespace */
<PAGE_SETTING,TITLE_BLOCK>\n+         /* skip newlines */
<PAGE_SETTING,TITLE_BLOCK>"("         return 'LPAREN';
<PAGE_SETTING,TITLE_BLOCK>")"         { this.popState(); return 'RPAREN'; }
<PAGE_SETTING,TITLE_BLOCK>","         return 'COMMA';
<PAGE_SETTING,TITLE_BLOCK>":"         return 'COLON';
<PAGE_SETTING,TITLE_BLOCK>"\""[^"]*"\"" { yytext = yytext.substring(1, yytext.length - 1); return 'STRING'; }

<PAGE_SETTING>"paper-dir"  return 'PAPER_DIR';
<PAGE_SETTING>"paper"      return 'PAPER';
<PAGE_SETTING>"scale"      return 'SCALE';
<PAGE_SETTING>"dpi"        return 'DPI';

<TITLE_BLOCK>"title"       return 'TITLE';
<TITLE_BLOCK>"date"        return 'DATE';
<TITLE_BLOCK>"rev"         return 'REV';
<TITLE_BLOCK>"company"     return 'COMPANY';
<TITLE_BLOCK>"comment"     return 'COMMENT';

<PAGE_SETTING,TITLE_BLOCK>[a-zA-Z0-9_\-\.]+ return 'IDENTIFIER';

[ \t]+              /* skip whitespace */
\n+                 return 'NL';

[a-zA-Z0-9_\-]+      return 'IDENTIFIER';
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
  : document statement NL
  | statement NL
  | document NL
  | NL
  ;

statement
  : subgraph
  | page_setting
  | title_block
  ;

subgraph
  : subgraph_head NL document END
  | subgraph_head statement END
  ;

subgraph_head
  : SUBGRAPH IDENTIFIER LBRACK STRING RBRACK { yy.addPage($2, $4); }
  ;

page_setting
  : PAGE_SETTING LPAREN page_setting_items RPAREN { 
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
  ;

page_setting_value
  : STRING
  | IDENTIFIER
  ;

title_block
  : TITLE_BLOCK LPAREN title_block_items RPAREN { 
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
