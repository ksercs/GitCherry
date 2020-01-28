branch_name="$(git rev-parse --abbrev-ref HEAD)"
$(node .vscode/open_PR.js $branch_name)