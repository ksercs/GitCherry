# dx-gitAutomation

## Installation

1) *Project tasks configurating*\
Move all files from *.vscode* folder to your project *.vscode* folder (replace *tasks.json*)
2) *Selenium installing*\
Run `npm i selenium-webdriver chromedriver -g` to install packages
3) *VS Code keybindings configurating*\
Open *File -> Preferences -> Keyboard ShortCuts* in VS Code. Open it as a json - click on the icon in the top right corner of the editor ("Open Keyboard ShortCuts (JSON)"). Replace shortcuts file text with the text of *keybindings.json* file.
4) *Hiding new scripts for git*
- Rename *.vscode/gitignore* to *.vscode/.gitignore*
- Run `git update-index --skip-worktree .vscode/tasks.json` to hide tracking *tasks.json* file for git
5) *Pull request opening automation*\
Configurate .vscode/env.js for pull request opening automation

## Usage

`crtl + g + c`(**G**it **C**ommit) - commit. Inpit field for entering a message will appear at the top of the editor.

`crtl + g + p`(**G**it **P**ush) - push to the current branch of fork.

`crtl + g + b`(**G**it **B**ranch) - new branch creating. The script will fetch last changes from upstream/20_1 branch, and create new one, branched from      upstream/20_1. After branch creating gulp will be called. If you need to install a packages before run gulp dev, you can define *-i* as the second argument (by input field at the top of the editor)

`crtl + g + g`(**G**it **G**raft) - cherry-picking. The script will create new branch, based on updated upstream/19_2 with and named as the current branch, but with '19_2' suffix. Next the script will graft all commits from the current branch to created. If there are any merge conflicts you should resolve it manually. After cherry picking you should push the changes and create pull request.

`ctrl + g + m`(**G**it **M**erge request) - opening the pull request. The scripts will remove PR description, assign PR to you, add reviewers by usernames from ENV.REVIEWS, and add labels: '20_1' by default or '19_2' & 'cherry-picking' if there is '19_2' suffix in branch name. The PR's name will be equal to first commit message.

`ctrl + shift + b` - run one of 3 build commands: `npm run build`, `npm i` or `gulp dev` depending on picked string in the droppped down list at the top of the editor.

