#!/bin/bash
# highlight
# args: 1: size, 2: lang
function keycode() {
  pbpaste | \
    highlight \
    	--font Inconsolata \
    	--font-size $1 \
    	--style fine_blue_darker \
    	--src-lang $2 \
    	--out-format rtf | \
    pbcopy
}
