current_branch="$(git rev-parse --abbrev-ref HEAD)"

git fetch upstream "$1"
git checkout upstream/"$1" || exit 1
git checkout -b "$2" || (git checkout $current_branch && exit 1)

if [[ "$3" == "-i" ]];
then
    npm i
    gulp dev
fi

if [[ "$3" != "-no" ]];
then gulp dev
fi