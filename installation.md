## Installation
 
### Getting the code

```
git clone https://github.com/ksercs/GitCherry.git
```

Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)
- [NodeJS and npm](https://nodejs.org/)

### Dependencies

From a terminal in the repository directory execute the following command to install the required dependencies:

```
npm i
```

### Watch

During development you can use a watcher to make builds on changes quick and easy. From a terminal in the repository directory execute the following command:

```
npm run watch
```

### Bundling

To generate a production bundle (without packaging) run the following from a terminal:

```
npm run webpack:prod
```

To generate a VSIX (installation package) run the following from a terminal:

```
npm run package
```

## Debugging

1. Open the `GitCherry` folder
2. Ensure the required [dependencies](#dependencies) are installed
3. Start the [`watch`](#watch) task
4. Choose the `Run Extension` launch configuration from the launch dropdown in the Debug viewlet and press `F5`.
