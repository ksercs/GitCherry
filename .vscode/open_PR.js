require('chromedriver');
const { Builder, By, Key, Capabilities } = require('selenium-webdriver');

const ENV = require('./env');

async function openPullRequest(branchName) {
    const getElement = async(driver, xpath) => {
        return await driver.findElement(By.xpath(xpath));
    };

    const asyncForEach = async function(array, callback) {
        for(let index = 0; index < array.length; ++index) {
            await callback(array[index], index, array);
        }
    };

    const selectFields = async function(driver, menuButtonXpath, inputFieldXpath, filters) {
        const menuButton = await getElement(driver, menuButtonXpath);
        const labelFilter = await getElement(driver, inputFieldXpath);
        await menuButton.click();

        await asyncForEach(filters, async(name) => {
            await labelFilter.sendKeys(name);
            await driver.sleep(2000);
            await labelFilter.sendKeys(Key.ENTER);
            await labelFilter.clear();
        });
        await menuButton.click();
    };

    const masterBranch = branchName.slice(-4) === '19_2' ? '19_2' : '20_1';

    const labels = [ masterBranch ];
    if(masterBranch === '19_2') {
        labels.push('cherry-pick');
    }

    const capabilities = Capabilities.chrome();
    capabilities.set('goog:chromeOptions', {
        'args': ['--headless']
    });

    const driver = new Builder()
        .forBrowser('chrome')
        .withCapabilities(capabilities)
        .build();

    const DIFF_CHANGES_URL = `https://github.com/DevExpress/DevExtreme/compare/${masterBranch}...${ENV.LOGIN}:${branchName}`;
    const SIGN_IN_BUTTON = '/html/body/div[1]/header/div/div[2]/div[2]/a[1]';
    const LOGIN_FIELD = '//*[@id="login_field"]';
    const PASSWORD_FIELD = '//*[@id="password"]';
    const LOGIN_BUTTON = '//*[@id="login"]/form/div[3]/input[8]';
    const OPEN_PR_BUTTON = '//*[@id="js-repo-pjax-container"]/div[2]/div/div[2]/div/button';
    const PR_DESCR_FIELD = '//*[@id="pull_request_body"]';
    const SELF_ASSIGN_BUTTON = '//*[@id="new_pull_request"]/div/div[2]/div[2]/div/span/button';
    const LABELS_MENU_BUTTON = '//*[@id="labels-select-menu"]';
    const LABEL_INPUT = '//*[@id="label-filter-field"]';
    const REVIEW_MENU_BUTTON = '//*[@id="reviewers-select-menu"]';
    const REVIEW_FILTER_FIELD = '//*[@id="review-filter-field"]';
    const CREATE_PR_BUTTON = '//*[@id="new_pull_request"]/div/div[1]/div/div/div[2]/div/button';

    try {
        await driver.get(DIFF_CHANGES_URL);

        await (await getElement(driver, SIGN_IN_BUTTON)).click();

        await (await getElement(driver, LOGIN_FIELD)).sendKeys(ENV.LOGIN);
        await (await getElement(driver, PASSWORD_FIELD)).sendKeys(ENV.PASSWORD);
        await (await getElement(driver, LOGIN_BUTTON)).click();

        await (await getElement(driver, OPEN_PR_BUTTON)).click();

        await (await getElement(driver, PR_DESCR_FIELD)).sendKeys(Key.CONTROL + 'a' + Key.BACK_SPACE);

        await (await getElement(driver, SELF_ASSIGN_BUTTON)).click();

        await selectFields(driver, LABELS_MENU_BUTTON, LABEL_INPUT, labels);

        await selectFields(driver, REVIEW_MENU_BUTTON, REVIEW_FILTER_FIELD, ENV.REVIEWS);

        await (await getElement(driver, CREATE_PR_BUTTON)).click();
    } finally {
        await driver.sleep(50000);
        await driver.quit();
    }
}

openPullRequest(process.argv[2]);
