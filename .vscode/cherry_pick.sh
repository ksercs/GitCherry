current_branch="$(git rev-parse --abbrev-ref HEAD)"

first_commit_full="$(git log upstream/20_1.."$current_branch" --oneline | tail -1)"
last_commit_full="$(git log --oneline -n 1)"

first_commit=${first_commit_full/%\ */}
last_commit=${last_commit_full/%\ */}

(./.vscode/new_branch.sh 19_2 "$current_branch"_19_2 -no) || exit 1


if [[ "$first_commit" == "$last_commit" ]];
then git cherry-pick "$first_commit"
else git cherry-pick "$first_commit".."$last_commit"
fi
