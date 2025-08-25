// モックデータ (実際のアプリケーションではバックエンドから取得します)
const mockUserInfo = [
    { id: 'user123', first_name: '田中', last_name: '太郎', manager_id: 'manager456' },
    { id: 'manager456', first_name: '鈴木', last_name: '一郎', manager_id: null }, // マネージャー
    { id: 'user789', first_name: '佐藤', last_name: '花子', manager_id: 'manager456' }
];

const mockWorkflows = [
    { id: 'wf1_attendance', frow_name: '勤怠連絡' },
    { id: 'wf2_purchase', frow_name: '定期購入' },
    { id: 'wf3_certificate', frow_name: '資格申請' },
    { id: 'wf4_dependent', frow_name: '扶養届け' },
    { id: 'wf5_month_end', frow_name: '月末処理' },
    { id: 'wf6_address_change', frow_name: '住所変更' }
];

// DOM要素の取得
const appContainer = document.getElementById('app-container');
const messageBox = document.getElementById('message-box');

// Global Modal DOM elements
const globalConfirmationModal = document.getElementById('globalConfirmationModal');
const globalConfirmContent = document.getElementById('globalConfirmContent');
const globalCancelConfirmButton = document.getElementById('globalCancelConfirmButton');
const globalConfirmSubmitButton = document.getElementById('globalConfirmSubmitButton');

const globalMessageModal = document.getElementById('globalMessageModal');
const globalMessageTitle = document.getElementById('globalMessageTitle');
const globalMessageContent = document.getElementById('globalMessageContent');
const globalCloseMessageModalButton = document.getElementById('globalCloseMessageModalButton');

// Variables to store modal callbacks
let currentOnConfirmCallback = null;
let currentOnCancelCallback = null;
let currentOnMessageCloseCallback = null;
let currentFormId = ''; // 現在のフォームのIDを保持

/**
 * カスタムメッセージボックスを表示する関数 (ページ上部に表示される一時的なメッセージ)
 * @param {string} message - 表示するメッセージ
 * @param {string} type - 'success' または 'error'
 */
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = 'message-box show'; // 基本スタイルと表示状態を適用

    // タイプに応じたスタイルを適用
    if (type === 'error') {
        messageBox.classList.add('error');
    } else {
        messageBox.classList.remove('error');
    }

    // 3秒後にメッセージボックスを非表示にする
    setTimeout(() => {
        messageBox.classList.remove('show');
        // 非表示になった後にクラスをリセット（特にエラークラス）
        setTimeout(() => {
            messageBox.className = 'message-box';
        }, 300); // transitionの時間と合わせる
    }, 3000);
}

/**
 * 共通の確認モーダルを表示する関数
 * @param {string} title - モーダルのタイトル
 * @param {string} contentHtml - モーダルに表示するHTMLコンテンツ
 * @param {Function} onConfirm - 「送信」ボタンがクリックされたときに実行されるコールバック
 * @param {Function} onCancel - 「修正」ボタンがクリックされたときに実行されるコールバック
 */
function openConfirmationModal(title, contentHtml, onConfirm, onCancel) {
    globalConfirmationModal.querySelector('h2').textContent = title;
    globalConfirmContent.innerHTML = contentHtml;
    currentOnConfirmCallback = onConfirm;
    currentOnCancelCallback = onCancel;
    globalConfirmationModal.classList.remove('hidden');
}

/**
 * 共通の確認モーダルを閉じる関数
 */
function closeConfirmationModal() {
    globalConfirmationModal.classList.add('hidden');
    currentOnConfirmCallback = null;
    currentOnCancelCallback = null;
}

// 「修正」ボタンのイベントリスナー
globalCancelConfirmButton.addEventListener('click', () => {
    if (currentOnCancelCallback) {
        currentOnCancelCallback();
    }
    closeConfirmationModal();
});

// 「送信」ボタンのイベントリスナー
globalConfirmSubmitButton.addEventListener('click', () => {
    if (currentOnConfirmCallback) {
        currentOnConfirmCallback();
    }
    closeConfirmationModal(); // 送信後は確認モーダルを閉じる
});

/**
 * 共通のメッセージモーダルを表示する関数
 * @param {string} title - モーダルのタイトル
 * @param {string} contentHtml - モーダルに表示するHTMLコンテンツ
 * @param {Function} onClose - 「閉じる」ボタンがクリックされたときに実行されるコールバック
 * @param {boolean} isError - エラーメッセージかどうか (trueなら赤色表示)
 */
function openMessageModal(title, contentHtml, onClose, isError = false) {
    globalMessageTitle.textContent = title;
    globalMessageContent.innerHTML = contentHtml;
    currentOnMessageCloseCallback = onClose;

    if (isError) {
        globalMessageTitle.classList.add('text-red-600');
        globalMessageTitle.classList.remove('text-gray-800');
    } else {
        globalMessageTitle.classList.remove('text-red-600');
        globalMessageTitle.classList.add('text-gray-800');
    }

    globalMessageModal.classList.remove('hidden');
}

/**
 * 共通のメッセージモーダルを閉じる関数
 */
function closeMessageModal() {
    globalMessageModal.classList.add('hidden');
    if (currentOnMessageCloseCallback) {
        currentOnMessageCloseCallback();
    }
    currentOnMessageCloseCallback = null;
}

// メッセージモーダルの「閉じる」ボタンのイベントリスナー
globalCloseMessageModalButton.addEventListener('click', closeMessageModal);


/**
 * ログイン画面をレンダリングする関数
 */
function renderLoginScreen() {
    // app-containerのスタイルをログイン画面用に調整
    appContainer.classList.add('max-w-md'); // ログイン画面の最大幅を適用
    appContainer.classList.add('p-8'); // ログイン画面のパディングを適用
    appContainer.classList.remove('max-w-screen-lg'); // ワークフロー画面の幅を解除
    appContainer.classList.remove('p-6'); // ワークフロー画面のパディングを解除

    appContainer.innerHTML = `
        <div class="login-content">
            <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">システムログイン</h2>

            <div id="errorMessage" class="text-red-600 text-center mb-6 font-medium h-6">
                </div>

            <form id="loginForm" class="space-y-6">
                <div>
                    <label for="loginId" class="block text-sm font-medium text-gray-700 mb-1">ログインID</label>
                    <input
                        type="text"
                        id="loginId"
                        name="loginId"
                        maxlength="50"
                        placeholder="ログインIDを入力してください"
                        required
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-base focus:outline-none transition duration-150 ease-in-out"
                    >
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        maxlength="16"
                        placeholder="パスワードを入力してください"
                        required
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-base focus:outline-none transition duration-150 ease-in-out"
                    >
                </div>

                <div>
                    <button
                        type="submit"
                        id="loginButton"
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:scale-95"
                    >
                        ログイン
                    </button>
                    <button
                        type="button"
                        id="createAccountBtn"
                        class="w-full flex justify-center py-2.5 px-4 mt-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:scale-95"
                    >
                        新規アカウント作成
                    </button>
                </div>
            </form>
        </div>
    `;

    const loginForm = document.getElementById('loginForm');
    const loginIdInput = document.getElementById('loginId');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('errorMessage');
    const createAccountBtn = document.getElementById('createAccountBtn');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // フォームのデフォルト送信を防止

        errorMessageDiv.textContent = ''; // エラーメッセージをクリア

        const loginId = loginIdInput.value;
        const password = passwordInput.value;

        // ログイン処理のシミュレーション
        if (loginId === 'jqit@gmail.com' && password === 'password') {
            showMessage('ログイン成功！ワークフロー画面へ遷移します。', 'success');
            setTimeout(() => {
                renderWorkflowScreen();
            }, 1000); // メッセージ表示後に遷移
        } else {
            const errorMessage = 'ログインIDまたはパスワードが正しくありません。';
            errorMessageDiv.textContent = errorMessage;
            showMessage(errorMessage, 'error');
        }
    });

    createAccountBtn.addEventListener('click', () => {
        renderCreateAccountScreen();
    });
}

/**
 * 新規アカウント作成画面をレンダリングする関数
 */
function renderCreateAccountScreen() {
    appContainer.classList.add('max-w-md');
    appContainer.classList.add('p-8');
    appContainer.classList.remove('max-w-screen-lg');
    appContainer.classList.remove('p-6');

    appContainer.innerHTML = `
        <div class="create-account-content">
            <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">新規アカウント作成</h2>
            <div id="createAccountErrorMessage" class="text-red-600 text-center mb-6 font-medium h-6"></div>
            <form id="createAccountForm" class="space-y-6">
                <div>
                    <label for="newLoginId" class="block text-sm font-medium text-gray-700 mb-1">ログインID:</label>
                    <input type="text" id="newLoginId" name="newLoginId" required
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-base focus:outline-none transition duration-150 ease-in-out">
                </div>
                <div>
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">パスワード:</label>
                    <input type="password" id="newPassword" name="newPassword" required
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-base focus:outline-none transition duration-150 ease-in-out">
                </div>
                <div>
                    <button type="submit"
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:scale-95">
                        アカウントを作成する
                    </button>
                    <button type="button" id="backToLoginBtn"
                        class="w-full flex justify-center py-2.5 px-4 mt-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:scale-95">
                        ログイン画面に戻る
                    </button>
                </div>
            </form>
        </div>
    `;

    const createAccountForm = document.getElementById('createAccountForm');
    const newLoginIdInput = document.getElementById('newLoginId');
    const newPasswordInput = document.getElementById('newPassword');
    const createAccountErrorMessageDiv = document.getElementById('createAccountErrorMessage');
    const backToLoginBtn = document.getElementById('backToLoginBtn');

    createAccountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createAccountErrorMessageDiv.textContent = '';

        if (!newLoginIdInput.value.trim() || !newPasswordInput.value.trim()) {
            createAccountErrorMessageDiv.textContent = 'すべての項目を入力してください。';
            showMessage('すべての項目を入力してください。', 'error');
            return;
        }

        // ここでアカウント作成処理を実装 (今回はシミュレーション)
        console.log('アカウント作成成功 (シミュレーション)');
        showMessage('アカウントが作成されました！ログイン画面に戻ります。', 'success');
        setTimeout(() => {
            renderLoginScreen();
        }, 1000);
    });

    backToLoginBtn.addEventListener('click', () => {
        renderLoginScreen();
    });
}


/**
 * ワークフロー画面をレンダリングする関数
 */
function renderWorkflowScreen() {
    // app-containerのスタイルをワークフロー画面用に調整
    appContainer.classList.remove('max-w-md'); // ログイン画面の最大幅を解除
    appContainer.classList.remove('p-8'); // ログイン画面のパディングを解除
    appContainer.classList.add('max-w-screen-lg'); // ワークフロー画面の幅を適用 (lg: 1024px)
    appContainer.classList.add('p-6'); // ワークフロー画面のパディングを適用

    appContainer.innerHTML = `
        <div class="workflow-content space-y-6">
            <header class="header-bg p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between items-center sm:space-x-8 shadow-md">
                <div class="flex flex-col sm:flex-row sm:space-x-8 w-full sm:w-auto mb-4 sm:mb-0">
                    <div class="mb-2 sm:mb-0">
                        <label for="userName" class="block text-sm font-medium text-gray-700">ユーザー名</label>
                        <div id="userName" class="label mt-1 text-base text-gray-900 font-semibold rounded-md bg-gray-100 px-3 py-2 w-full sm:w-64 border border-gray-300">
                            ユーザー一覧表：ユーザー名
                        </div>
                    </div>
                    <div>
                        <label for="managerName" class="block text-sm font-medium text-gray-700">管理営業名</label>
                        <div id="managerName" class="label mt-1 text-base text-gray-900 font-semibold rounded-md bg-gray-100 px-3 py-2 w-full sm:w-64 border border-gray-300">
                            管理営業一覧表：管理営業名
                        </div>
                    </div>
                </div>
                <div class="w-full sm:w-auto flex justify-end mt-4 sm:mt-0">
                    <button id="logoutButton" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
                        ログアウト
                    </button>
                </div>
            </header>

            <section class="bg-white p-6 rounded-lg shadow-md">
                <label for="workflowType" class="block text-sm font-medium text-gray-700 mb-2">ワークフロータイプ <span class="text-red-500">*</span></label>
                <select id="workflowType" class="mt-1 block w-full sm:w-1/2 lg:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm">
                    <option value="">選択してください</option>
                    </select>
            </section>

            <section id="dynamicWorkflowArea" class="dynamic-area-bg p-6 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-600 text-base shadow-md">
                <p class="font-bold text-lg mb-4">ここより下はワークフローの種類により変動する</p>
                <div id="dynamicContent" class="text-gray-800 text-xl font-medium">
                    ワークフロータイプが選択されていません。
                </div>
            </section>
        </div>
    `;

    // ワークフロー画面のDOM要素を取得
    const userNameElement = document.getElementById('userName');
    const managerNameElement = document.getElementById('managerName');
    const logoutButton = document.getElementById('logoutButton');
    const workflowTypeSelect = document.getElementById('workflowType');
    const dynamicWorkflowArea = document.getElementById('dynamicWorkflowArea');
    const dynamicContentElement = document.getElementById('dynamicContent');


    // 1. ユーザー名と管理営業名の表示
    try {
        const loggedInUserId = 'user123'; // 例として 'user123' をログインユーザーとする

        const currentUser = mockUserInfo.find(user => user.id === loggedInUserId);

        if (currentUser) {
            userNameElement.textContent = `${currentUser.first_name} ${currentUser.last_name}`;

            if (currentUser.manager_id) {
                const manager = mockUserInfo.find(user => user.id === currentUser.manager_id);
                if (manager) {
                    managerNameElement.textContent = `${manager.first_name} ${manager.last_name}`;
                } else {
                    managerNameElement.textContent = '管理営業情報が見つかりません';
                    console.warn(`Manager with ID ${currentUser.manager_id} not found.`);
                }
            } else {
                managerNameElement.textContent = '担当管理営業はいません';
            }
        } else {
            userNameElement.textContent = 'ログインユーザー情報が見つかりません';
            managerNameElement.textContent = '管理営業情報が見つかりません';
            console.error(`Logged in user with ID ${loggedInUserId} not found.`);
        }
    } catch (error) {
        console.error('ユーザー名または管理営業名の表示中にエラーが発生しました:', error);
        userNameElement.textContent = '情報の読み込みに失敗しました';
        managerNameElement.textContent = '情報の読み込みに失敗しました';
    }

    // 2. ログアウトボタンの機能 (ログイン画面に戻る)
    logoutButton.addEventListener('click', () => {
        console.log('データを破棄しました。');
        showMessage('ログアウトしました。ログイン画面へ遷移します。', 'success');
        setTimeout(() => {
            renderLoginScreen(); // ログイン画面を再レンダリング
        }, 1000);
    });

    // 3. ワークフロータイププルダウンの選択肢設定
    try {
        mockWorkflows.forEach(workflow => {
            const option = document.createElement('option');
            option.value = workflow.id; // 値は内部的なID
            option.textContent = workflow.frow_name; // 表示名は日本語名
            workflowTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('ワークフロータイプのプルダウン設定中にエラーが発生しました:', error);
        const errorOption = document.createElement('option');
        errorOption.value = "";
        errorOption.textContent = "読み込みエラー";
        errorOption.disabled = true;
        workflowTypeSelect.appendChild(errorOption);
    }

    // 4. ワークフローの種類により変動する領域の更新
    workflowTypeSelect.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        dynamicWorkflowArea.innerHTML = ''; // クリア existing content

        if (selectedValue === "") {
            dynamicWorkflowArea.innerHTML = `
                <p class="font-bold text-lg mb-4">ここより下はワークフローの種類により変動する</p>
                <div id="dynamicContent" class="text-gray-800 text-xl font-medium">
                    ワークフロータイプが選択されていません。
                </div>
            `;
        } else {
            const selectedWorkflow = mockWorkflows.find(wf => wf.id === selectedValue);
            if (selectedWorkflow) {
                loadWorkflowContent(selectedWorkflow.id);
            } else {
                dynamicWorkflowArea.innerHTML = `
                    <p class="font-bold text-lg mb-4">ここより下はワークフローの種類により変動する</p>
                    <div id="dynamicContent" class="text-red-500 text-xl font-medium">
                        選択されたワークフローが見つかりません。
                    </div>
                `;
            }
        }
    });
}

/**
 * ワークフローコンテンツを動的にロードする関数
 * @param {string} workflowId - ロードするワークフローのID
 */
function loadWorkflowContent(workflowId) {
    let contentHtml = '';
    // 各ワークフローIDに基づいて適切なHTMLコンテンツを挿入
    switch (workflowId) {
        case 'wf1_attendance':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">勤怠連絡</h1>

                    <form id="attendanceForm" class="space-y-6">
                        <div class="form-group">
                            <label for="contactDate" class="block text-sm font-medium text-gray-700 mb-1">
                                連絡日付 <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input type="date" id="contactDate" name="contactDate"
                                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none pr-10"
                                       required>
                            </div>
                            <p id="contactDateError" class="error-message hidden">有効な日付（YYYY/MM/DD）を入力してください。</p>
                        </div>

                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                事由（勤怠内容） <span class="text-red-500">*</span>
                            </label>
                            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="0" class="form-radio text-blue-600 rounded-full" checked>
                                    <span class="ml-2 text-gray-700">0: 有給</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="1" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">1: 代休</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="2" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">2: 欠勤</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="3" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">3: 遅刻</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="4" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">4: 早退</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="5" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">5: 中抜け</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="6" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">6: 忌引き</span>
                                </label>
                            </div>
                        </div>

                        <div id="lateTimeSection" class="hidden form-group">
                            <label for="lateTime" class="block text-sm font-medium text-gray-700 mb-1">
                                遅刻時間
                            </label>
                            <select id="lateTime" name="lateTime"
                                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                </select>
                        </div>

                        <div id="earlyLeaveTimeSection" class="hidden form-group">
                            <label for="earlyLeaveTime" class="block text-sm font-medium text-gray-700 mb-1">
                                早退時間 (HH:mm)
                            </label>
                            <input type="text" id="earlyLeaveTime" name="earlyLeaveTime" maxlength="5"
                                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                   placeholder="例: 17:30">
                            <p id="earlyLeaveTimeError" class="error-message hidden">有効な時間（HH:mm）を入力してください。</p>
                        </div>

                        <div id="substituteDateSection" class="hidden form-group">
                            <label for="substituteDate" class="block text-sm font-medium text-gray-700 mb-1">
                                代休消化日
                            </label>
                            <div class="relative">
                                <input type="date" id="substituteDate" name="substituteDate"
                                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none pr-10">
                            </div>
                            <p id="substituteDateError" class="error-message hidden">有効な日付（YYYY/MM/DD）を入力してください。</p>
                        </div>

                        <div class="form-group">
                            <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">
                                理由 (任意)
                            </label>
                            <textarea id="reason" name="reason" rows="4" maxlength="256"
                                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                      placeholder="勤怠連絡の理由を入力してください（最大256文字）"></textarea>
                            <p id="reasonError" class="error-message hidden">理由の文字数が制限を超えています（最大256文字）。</p>
                        </div>

                        <div class="flex justify-center mt-6">
                            <button type="button" id="submitButton_attendance" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            // 勤怠連絡フォームのJSロジック
            document.getElementById('dynamicWorkflowArea').innerHTML = contentHtml;
            const attendanceForm = document.getElementById('attendanceForm');
            const reasonTypeRadios = attendanceForm.querySelectorAll('input[name="reasonType"]');
            const lateTimeSection = document.getElementById('lateTimeSection');
            const earlyLeaveTimeSection = document.getElementById('earlyLeaveTimeSection');
            const earlyLeaveTimeInput = document.getElementById('earlyLeaveTime');
            const substituteDateSection = document.getElementById('substituteDateSection');
            const submitButton_attendance = document.getElementById('submitButton_attendance');

            // 遅刻時間セレクトボックスのオプションを生成
            const lateTimeSelect = document.getElementById('lateTime');
            for (let i = 1; i <= 60; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i}分`;
                lateTimeSelect.appendChild(option);
            }

            // 事由選択時の表示・非表示制御
            function updateFormVisibility() {
                const selectedReason = attendanceForm.querySelector('input[name="reasonType"]:checked').value;
                lateTimeSection.classList.add('hidden');
                earlyLeaveTimeSection.classList.add('hidden');
                substituteDateSection.classList.add('hidden');
                switch (selectedReason) {
                    case '3': // 遅刻
                        lateTimeSection.classList.remove('hidden');
                        break;
                    case '4': // 早退
                        earlyLeaveTimeSection.classList.remove('hidden');
                        break;
                    case '1': // 代休
                        substituteDateSection.classList.remove('hidden');
                        break;
                }
            }

            reasonTypeRadios.forEach(radio => {
                radio.addEventListener('change', updateFormVisibility);
            });
            updateFormVisibility(); // 初回ロード時にも実行

            // フォームのバリデーションと送信確認
            submitButton_attendance.addEventListener('click', () => {
                const contactDate = attendanceForm.querySelector('#contactDate').value;
                const reasonType = attendanceForm.querySelector('input[name="reasonType"]:checked').value;
                const lateTime = attendanceForm.querySelector('#lateTime').value;
                const earlyLeaveTime = attendanceForm.querySelector('#earlyLeaveTime').value;
                const substituteDate = attendanceForm.querySelector('#substituteDate').value;
                const reason = attendanceForm.querySelector('#reason').value;

                // バリデーション
                const errors = [];
                if (!contactDate) {
                    errors.push('連絡日付は必須です。');
                }
                if (reasonType === '3' && !lateTime) {
                    errors.push('遅刻時間を選択してください。');
                }
                if (reasonType === '4' && (!earlyLeaveTime || !/^\d{2}:\d{2}$/.test(earlyLeaveTime))) {
                    errors.push('有効な早退時間（HH:mm）を入力してください。');
                }
                if (reasonType === '1' && !substituteDate) {
                    errors.push('代休消化日は必須です。');
                }

                if (errors.length > 0) {
                    openMessageModal('入力エラー', `<p>以下の項目を確認してください:</p><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`, null, true);
                    return;
                }
                
                // 確認モーダルの内容を生成
                let confirmContent = `
                    <p><strong>連絡日付:</strong> ${contactDate}</p>
                    <p><strong>事由:</strong> ${attendanceForm.querySelector(`input[name="reasonType"][value="${reasonType}"]`).nextElementSibling.textContent}</p>
                `;
                if (reasonType === '3') {
                    confirmContent += `<p><strong>遅刻時間:</strong> ${lateTime}分</p>`;
                }
                if (reasonType === '4') {
                    confirmContent += `<p><strong>早退時間:</strong> ${earlyLeaveTime}</p>`;
                }
                if (reasonType === '1') {
                    confirmContent += `<p><strong>代休消化日:</strong> ${substituteDate}</p>`;
                }
                if (reason) {
                    confirmContent += `<p><strong>理由:</strong> ${reason}</p>`;
                }

                openConfirmationModal(
                    '勤怠連絡の確認',
                    confirmContent,
                    () => {
                        // 送信処理のシミュレーション
                        const dataToSend = {
                            contactDate,
                            reasonType,
                            lateTime,
                            earlyLeaveTime,
                            substituteDate,
                            reason
                        };
                        console.log('勤怠連絡データを送信します:', dataToSend);
                        // 実際のAPI送信処理はここに記述
                        // 成功したらメッセージモーダルを表示
                        openMessageModal('送信成功', '勤怠連絡を送信しました！', () => {
                            clearFormInputs(attendanceForm);
                        });
                    },
                    () => {
                        // 修正ボタンが押された場合、何もしない
                    }
                );
            });
            break;
        case 'wf2_purchase': // 定期購入
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">定期購入</h1>
                    <form id="subscription-form" class="space-y-6">
                        <div class="form-group">
                            <label for="subscriptionDate">定期購入日:</label>
                            <input type="date" id="subscriptionDate" name="subscriptionDate" required class="w-full">
                            <div class="error-message" id="subscriptionDate-error"></div>
                        </div>
                        <div class="form-group">
                            <label for="nearestStation">最寄り駅:</label>
                            <input type="text" id="nearestStation" name="nearestStation" required class="w-full">
                            <div class="error-message" id="nearestStation-error"></div>
                        </div>
                        <div class="form-group">
                            <label for="destinationStation">目的駅:</label>
                            <input type="text" id="destinationStation" name="destinationStation" class="w-full">
                        </div>
                        <div id="route-options" class="space-y-4">
                            <div class="route-option p-4 border border-dashed border-gray-300 rounded-md">
                                <h3 class="text-lg font-semibold mb-2">候補 1</h3>
                                <div class="form-group">
                                    <label for="transitStation1">経由駅:</label>
                                    <input type="text" id="transitStation1" name="transitStation[]" class="w-full">
                                </div>
                                <div class="form-group">
                                    <label for="commuteTime1">通勤時間:</label>
                                    <select id="commuteTime1" name="commuteTime[]" required class="w-full">
                                        <option value="">選択してください</option>
                                        <option value="15分未満">15分未満</option>
                                        <option value="15分-30分">15分-30分</option>
                                        <option value="30分-1時間">30分-1時間</option>
                                        <option value="1時間以上">1時間以上</option>
                                    </select>
                                    <div class="error-message" id="commuteTime1-error"></div>
                                </div>
                                <div class="form-group">
                                    <label for="amount1">金額:</label>
                                    <input type="number" id="amount1" name="amount[]" required class="w-full">
                                    <div class="error-message" id="amount1-error"></div>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center space-x-4 mt-6">
                            <button type="button" id="addCandidateBtn" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out">
                                候補数追加
                            </button>
                            <button type="submit" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                        <div class="flex justify-center mt-4">
                            <button type="button" class="back-to-workflow-btn px-6 py-3 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 ease-in-out">
                                ワークフローに戻る
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.getElementById('dynamicWorkflowArea').innerHTML = contentHtml;
            let candidateCount = 1;
            const addCandidateBtn = document.getElementById('addCandidateBtn');
            const routeOptions = document.getElementById('route-options');

            addCandidateBtn.addEventListener('click', () => {
                candidateCount++;
                const newCandidateHtml = `
                    <div class="route-option p-4 border border-dashed border-gray-300 rounded-md mt-4">
                        <h3 class="text-lg font-semibold mb-2">候補 ${candidateCount}</h3>
                        <div class="form-group">
                            <label for="transitStation${candidateCount}">経由駅:</label>
                            <input type="text" id="transitStation${candidateCount}" name="transitStation[]" class="w-full">
                        </div>
                        <div class="form-group">
                            <label for="commuteTime${candidateCount}">通勤時間:</label>
                            <select id="commuteTime${candidateCount}" name="commuteTime[]" required class="w-full">
                                <option value="">選択してください</option>
                                <option value="15分未満">15分未満</option>
                                <option value="15分-30分">15分-30分</option>
                                <option value="30分-1時間">30分-1時間</option>
                                <option value="1時間以上">1時間以上</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="amount${candidateCount}">金額:</label>
                            <input type="number" id="amount${candidateCount}" name="amount[]" required class="w-full">
                        </div>
                    </div>
                `;
                routeOptions.insertAdjacentHTML('beforeend', newCandidateHtml);
            });
            break;
        case 'wf3_certificate':
            contentHtml = `
                <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">資格申請</h1>
                    <div id="certificate_successMessage" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong class="font-bold">成功!</strong> <span class="block sm:inline ml-2"></span>
                    </div>
                    <div id="certificate_errorMessage" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong class="font-bold">エラー!</strong> <span class="block sm:inline ml-2"></span>
                    </div>
                    <div id="certificate_form_screen">
                        <div class="space-y-6">
                            <div class="form-group">
                                <label class="block text-gray-700 text-sm font-bold mb-2">
                                    資格申請種類選択
                                </label>
                                <div class="mt-2 flex flex-wrap gap-x-6">
                                    <label class="inline-flex items-center">
                                        <input type="radio" class="form-radio text-indigo-600 rounded-full" name="certificate_applicationType" value="0" checked />
                                        <span class="ml-2 text-gray-700">0: 取得前申請</span>
                                    </label>
                                    <label class="inline-flex items-center">
                                        <input type="radio" class="form-radio text-indigo-600 rounded-full" name="certificate_applicationType" value="1" />
                                        <span class="ml-2 text-gray-700">1: 取得後申請</span>
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="certificate_name" class="block text-sm font-medium text-gray-700 mb-1">
                                    資格名称 <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="certificate_name" name="certificate_name" required
                                    class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            </div>
                            <div class="form-group">
                                <label for="certificate_organization" class="block text-sm font-medium text-gray-700 mb-1">
                                    資格団体名 <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="certificate_organization" name="certificate_organization" required
                                    class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            </div>
                            <div id="certificate_examDateSection" class="form-group">
                                <label for="certificate_examDate" class="block text-sm font-medium text-gray-700 mb-1">
                                    受験日
                                </label>
                                <input type="date" id="certificate_examDate" name="certificate_examDate"
                                    class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            </div>
                            <div id="certificate_acquisitionDateSection" class="form-group hidden">
                                <label for="certificate_acquisitionDate" class="block text-sm font-medium text-gray-700 mb-1">
                                    取得日
                                </label>
                                <input type="date" id="certificate_acquisitionDate" name="certificate_acquisitionDate"
                                    class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            </div>
                            <div id="certificate_proofSection" class="form-group hidden">
                                <label for="certificate_proofFile" class="block text-sm font-medium text-gray-700 mb-1">
                                    取得証明書類 (PDF) <span class="text-red-500">*</span>
                                </label>
                                <input type="file" id="certificate_proofFile" name="certificate_proofFile" accept="application/pdf" required
                                    class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                            </div>
                            <div class="flex justify-center mt-6">
                                <button type="button" id="submitButton_certificate" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                    送信確認
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('dynamicWorkflowArea').innerHTML = contentHtml;
            const certForm = document.getElementById('submitButton_certificate').closest('form');
            const certTypeRadios = certForm.querySelectorAll('input[name="certificate_applicationType"]');
            const certExamDateSection = document.getElementById('certificate_examDateSection');
            const certAcquisitionDateSection = document.getElementById('certificate_acquisitionDateSection');
            const certProofSection = document.getElementById('certificate_proofSection');
            const certSubmitBtn = document.getElementById('submitButton_certificate');

            function updateCertFormVisibility() {
                const selectedType = certForm.querySelector('input[name="certificate_applicationType"]:checked').value;
                if (selectedType === '0') { // 取得前申請
                    certExamDateSection.classList.remove('hidden');
                    certAcquisitionDateSection.classList.add('hidden');
                    certProofSection.classList.add('hidden');
                    document.getElementById('certificate_examDate').required = true;
                    document.getElementById('certificate_acquisitionDate').required = false;
                    document.getElementById('certificate_proofFile').required = false;
                } else { // 取得後申請
                    certExamDateSection.classList.add('hidden');
                    certAcquisitionDateSection.classList.remove('hidden');
                    certProofSection.classList.remove('hidden');
                    document.getElementById('certificate_examDate').required = false;
                    document.getElementById('certificate_acquisitionDate').required = true;
                    document.getElementById('certificate_proofFile').required = true;
                }
            }

            certTypeRadios.forEach(radio => radio.addEventListener('change', updateCertFormVisibility));
            updateCertFormVisibility(); // Initial call

            certSubmitBtn.addEventListener('click', () => {
                const certName = document.getElementById('certificate_name').value;
                const certOrg = document.getElementById('certificate_organization').value;
                const certType = document.getElementById('certificate_applicationType').value;
                const examDate = document.getElementById('certificate_examDate').value;
                const acqDate = document.getElementById('certificate_acquisitionDate').value;
                const proofFile = document.getElementById('certificate_proofFile').files[0];

                const errors = [];
                if (!certName) errors.push('資格名称は必須です。');
                if (!certOrg) errors.push('資格団体名は必須です。');
                if (certType === '0' && !examDate) errors.push('受験日は必須です。');
                if (certType === '1' && !acqDate) errors.push('取得日は必須です。');
                if (certType === '1' && !proofFile) errors.push('取得証明書類の添付は必須です。');

                if (errors.length > 0) {
                    openMessageModal('入力エラー', `<p>以下の項目を確認してください:</p><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`, null, true);
                    return;
                }

                let confirmContent = `
                    <p><strong>申請種類:</strong> ${certType === '0' ? '取得前申請' : '取得後申請'}</p>
                    <p><strong>資格名称:</strong> ${certName}</p>
                    <p><strong>資格団体名:</strong> ${certOrg}</p>
                `;
                if (certType === '0') confirmContent += `<p><strong>受験日:</strong> ${examDate}</p>`;
                if (certType === '1') confirmContent += `<p><strong>取得日:</strong> ${acqDate}</p>`;
                if (certType === '1' && proofFile) confirmContent += `<p><strong>添付ファイル名:</strong> ${proofFile.name}</p>`;

                openConfirmationModal('資格申請の確認', confirmContent, () => {
                    console.log('資格申請データを送信します');
                    openMessageModal('送信成功', '資格申請データを送信しました！', () => {
                        clearFormInputs(certForm);
                    });
                });
            });
            break;
        case 'wf4_dependent':
            contentHtml = `
                <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">扶養届け</h1>
                    <form id="dependentForm" class="space-y-6">
                        <div class="form-group">
                            <label class="block text-gray-700 text-sm font-bold mb-2">扶養申請種類 <span class="text-red-500">*</span></label>
                            <div class="mt-2 flex flex-wrap gap-x-6">
                                <label class="inline-flex items-center">
                                    <input type="radio" class="form-radio text-indigo-600 rounded-full" name="dependentType" value="0" checked />
                                    <span class="ml-2 text-gray-700">0: 新規追加</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" class="form-radio text-indigo-600 rounded-full" name="dependentType" value="1" />
                                    <span class="ml-2 text-gray-700">1: 削除</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" class="form-radio text-indigo-600 rounded-full" name="dependentType" value="2" />
                                    <span class="ml-2 text-gray-700">2: 変更</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="dependentName" class="block text-sm font-medium text-gray-700 mb-1">扶養家族の氏名 <span class="text-red-500">*</span></label>
                            <input type="text" id="dependentName" name="dependentName" required class="w-full">
                        </div>

                        <div class="form-group">
                            <label for="dependentDob" class="block text-sm font-medium text-gray-700 mb-1">生年月日 <span class="text-red-500">*</span></label>
                            <input type="date" id="dependentDob" name="dependentDob" required class="w-full">
                        </div>

                        <div class="form-group">
                            <label for="dependentRelationship" class="block text-sm font-medium text-gray-700 mb-1">関係 <span class="text-red-500">*</span></label>
                            <input type="text" id="dependentRelationship" name="dependentRelationship" required class="w-full">
                        </div>

                        <div class="form-group">
                            <label for="dependentReason" class="block text-sm font-medium text-gray-700 mb-1">変更理由 (変更時のみ)</label>
                            <textarea id="dependentReason" name="dependentReason" rows="4" class="w-full"></textarea>
                        </div>

                        <div id="dependentProofSection" class="form-group">
                            <label for="dependentProofFile" class="block text-sm font-medium text-gray-700 mb-1">証明書類 (PDF) <span class="text-red-500">*</span></label>
                            <input type="file" id="dependentProofFile" name="dependentProofFile" accept="application/pdf" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                        </div>

                        <div class="flex justify-center mt-6">
                            <button type="button" id="submitButton_dependent" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.getElementById('dynamicWorkflowArea').innerHTML = contentHtml;
            const dependentForm = document.getElementById('dependentForm');
            const dependentTypeRadios = dependentForm.querySelectorAll('input[name="dependentType"]');
            const dependentReasonTextarea = document.getElementById('dependentReason');
            const dependentProofSection = document.getElementById('dependentProofSection');
            const dependentProofFile = document.getElementById('dependentProofFile');
            const dependentSubmitBtn = document.getElementById('submitButton_dependent');

            function updateDependentForm() {
                const selectedType = dependentForm.querySelector('input[name="dependentType"]:checked').value;
                if (selectedType === '2') { // 変更
                    dependentReasonTextarea.disabled = false;
                    dependentProofSection.classList.remove('hidden');
                    dependentProofFile.required = true;
                } else if (selectedType === '0') { // 新規追加
                    dependentReasonTextarea.disabled = true;
                    dependentProofSection.classList.remove('hidden');
                    dependentProofFile.required = true;
                } else { // 削除
                    dependentReasonTextarea.disabled = true;
                    dependentProofSection.classList.add('hidden');
                    dependentProofFile.required = false;
                }
            }
            dependentTypeRadios.forEach(radio => radio.addEventListener('change', updateDependentForm));
            updateDependentForm();

            dependentSubmitBtn.addEventListener('click', () => {
                const selectedType = dependentForm.querySelector('input[name="dependentType"]:checked').value;
                const name = document.getElementById('dependentName').value;
                const dob = document.getElementById('dependentDob').value;
                const relationship = document.getElementById('dependentRelationship').value;
                const reason = dependentReasonTextarea.value;
                const proofFile = dependentProofFile.files[0];

                const errors = [];
                if (!name) errors.push('氏名は必須です。');
                if (!dob) errors.push('生年月日は必須です。');
                if (!relationship) errors.push('関係は必須です。');
                if (selectedType !== '2' && !proofFile) errors.push('証明書類の添付は必須です。');

                if (errors.length > 0) {
                    openMessageModal('入力エラー', `<p>以下の項目を確認してください:</p><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`, null, true);
                    return;
                }

                let confirmContent = `
                    <p><strong>申請種類:</strong> ${['新規追加', '削除', '変更'][selectedType]}</p>
                    <p><strong>氏名:</strong> ${name}</p>
                    <p><strong>生年月日:</strong> ${dob}</p>
                    <p><strong>関係:</strong> ${relationship}</p>
                `;
                if (selectedType === '2' && reason) confirmContent += `<p><strong>変更理由:</strong> ${reason}</p>`;
                if (proofFile) confirmContent += `<p><strong>添付ファイル名:</strong> ${proofFile.name}</p>`;

                openConfirmationModal('扶養届けの確認', confirmContent, () => {
                    console.log('扶養届けデータを送信します');
                    openMessageModal('送信成功', '扶養届けデータを送信しました！', () => {
                        clearFormInputs(dependentForm);
                    });
                });
            });
            break;
        case 'wf5_month_end':
            contentHtml = `
                <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">月末処理</h1>
                    <form id="monthEndForm" class="space-y-6">
                        <div class="form-group">
                            <label for="monthEndMonth" class="block text-sm font-medium text-gray-700 mb-1">申請月 <span class="text-red-500">*</span></label>
                            <input type="month" id="monthEndMonth" name="monthEndMonth" required class="w-full">
                        </div>

                        <div class="form-group">
                            <label for="monthlyReport" class="block text-sm font-medium text-gray-700 mb-1">月次報告書 (PDF) <span class="text-red-500">*</span></label>
                            <input type="file" id="monthlyReport" name="monthlyReport" accept="application/pdf" required class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                        </div>

                        <div class="form-group">
                            <label for="monthEndNotes" class="block text-sm font-medium text-gray-700 mb-1">備考</label>
                            <textarea id="monthEndNotes" name="monthEndNotes" rows="4" class="w-full"></textarea>
                        </div>

                        <div class="flex justify-center mt-6">
                            <button type="button" id="submitButton_monthEnd" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.getElementById('dynamicWorkflowArea').innerHTML = contentHtml;
            const monthEndForm = document.getElementById('monthEndForm');
            const monthEndSubmitBtn = document.getElementById('submitButton_monthEnd');

            monthEndSubmitBtn.addEventListener('click', () => {
                const month = document.getElementById('monthEndMonth').value;
                const reportFile = document.getElementById('monthlyReport').files[0];
                const notes = document.getElementById('monthEndNotes').value;

                const errors = [];
                if (!month) errors.push('申請月は必須です。');
                if (!reportFile) errors.push('月次報告書の添付は必須です。');

                if (errors.length > 0) {
                    openMessageModal('入力エラー', `<p>以下の項目を確認してください:</p><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`, null, true);
                    return;
                }

                let confirmContent = `
                    <p><strong>申請月:</strong> ${month}</p>
                    <p><strong>月次報告書:</strong> ${reportFile.name}</p>
                `;
                if (notes) confirmContent += `<p><strong>備考:</strong> ${notes}</p>`;

                openConfirmationModal('月末処理の確認', confirmContent, () => {
                    console.log('月末処理データを送信します');
                    openMessageModal('送信成功', '月末処理データを送信しました！', () => {
                        clearFormInputs(monthEndForm);
                    });
                });
            });
            break;
        case 'wf6_address_change':
            contentHtml = `
                <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">住所変更</h1>
                    <form id="addressChangeForm" class="space-y-6">
                        <div class="form-group">
                            <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">郵便番号 <span class="text-red-500">*</span></label>
                            <div class="zip-code-group">
                                <input type="text" id="postalCode" name="postalCode" placeholder="例: 123-4567" maxlength="8" required class="w-full">
                                <button type="button" id="searchAddressBtn" class="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 focus:outline-none">住所検索</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="prefecture" class="block text-sm font-medium text-gray-700 mb-1">都道府県 <span class="text-red-500">*</span></label>
                            <input type="text" id="prefecture" name="prefecture" required class="w-full">
                        </div>

                        <div class="form-group">
                            <label for="city" class="block text-sm font-medium text-gray-700 mb-1">市区町村 <span class="text-red-500">*</span></label>
                            <input type="text" id="city" name="city" required class="w-full">
                        </div>

                        <div class="form-group">
                            <label for="street" class="block text-sm font-medium text-gray-700 mb-1">町名・番地 <span class="text-red-500">*</span></label>
                            <input type="text" id="street" name="street" required class="w-full">
                        </div>

                        <div class="form-group">
                            <label for="building" class="block text-sm font-medium text-gray-700 mb-1">建物名・部屋番号 (任意)</label>
                            <input type="text" id="building" name="building" class="w-full">
                        </div>

                        <div class="flex justify-center mt-6">
                            <button type="button" id="submitButton_addressChange" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            document.getElementById('dynamicWorkflowArea').innerHTML = contentHtml;
            const addressChangeForm = document.getElementById('addressChangeForm');
            const searchAddressBtn = document.getElementById('searchAddressBtn');
            const postalCodeInput = document.getElementById('postalCode');
            const prefectureInput = document.getElementById('prefecture');
            const cityInput = document.getElementById('city');
            const streetInput = document.getElementById('street');
            const addressSubmitBtn = document.getElementById('submitButton_addressChange');

            // 郵便番号から住所を自動入力する機能のシミュレーション
            searchAddressBtn.addEventListener('click', async () => {
                const postalCode = postalCodeInput.value.replace('-', '');
                if (postalCode.length !== 7 || isNaN(postalCode)) {
                    openMessageModal('入力エラー', '有効な7桁の郵便番号を入力してください。', null, true);
                    return;
                }
                
                // 郵便番号APIの代わりにモックデータを使用
                const mockAddresses = {
                    '1234567': { prefecture: '東京都', city: '中央区', street: '日本橋' },
                    '1000001': { prefecture: '東京都', city: '千代田区', street: '千代田' },
                    '5300001': { prefecture: '大阪府', city: '大阪市北区', street: '梅田' }
                };

                const address = mockAddresses[postalCode];
                if (address) {
                    prefectureInput.value = address.prefecture;
                    cityInput.value = address.city;
                    streetInput.value = address.street;
                    showMessage('住所を自動入力しました。', 'success');
                } else {
                    showMessage('住所が見つかりませんでした。手動で入力してください。', 'error');
                }
            });

            // フォームのバリデーションと送信
            addressSubmitBtn.addEventListener('click', async () => {
                if (addressChangeForm.checkValidity()) {
                    const dataToSend = {
                        postalCode: postalCodeInput.value,
                        prefecture: prefectureInput.value,
                        city: cityInput.value,
                        street: streetInput.value,
                        building: document.getElementById('building').value
                    };

                    const confirmContent = `
                        <p><strong>郵便番号:</strong> ${dataToSend.postalCode}</p>
                        <p><strong>住所:</strong> ${dataToSend.prefecture}${dataToSend.city}${dataToSend.street}</p>
                        ${dataToSend.building ? `<p><strong>建物名:</strong> ${dataToSend.building}</p>` : ''}
                    `;

                    openConfirmationModal('住所変更の確認', confirmContent, async () => {
                        // 実際の送信処理のシミュレーション
                        try {
                            const response = await fetch('/api/address-change', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(dataToSend)
                            });
                            if (!response.ok) throw new Error('Network response was not ok.');
                            openMessageModal('送信成功', '住所変更データを最終送信しました！', () => {
                                clearFormInputs(addressChangeForm);
                                // Optionally navigate back to workflow or show completion screen
                            });
                        } catch (error) {
                            console.error('送信エラー:', error);
                            openMessageModal('送信成功', '住所変更データを最終送信しました！', () => {
                                clearFormInputs(addressChangeForm);
                                // Optionally navigate back to workflow or show completion screen
                            });
                        }
                    }, () => {
                        // 修正ボタンが押された場合、何もしない
                    });
                } else {
                    openMessageModal('入力エラー', '入力に不備があります。必須項目を確認してください。', () => {}, true);
                }
            });
            break;
    }
}

// フォームの入力値をクリアするヘルパー関数
function clearFormInputs(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else if (input.type === 'file') {
            input.value = null; // ファイル入力はvalueをnullに
        } else {
            input.value = '';
        }
    });
    // ラジオボタンのデフォルト値を再設定
    const firstRadio = form.querySelector('input[type="radio"]');
    if (firstRadio) {
        firstRadio.checked = true;
    }
    // エラーメッセージを非表示に
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.classList.add('hidden'));
}

// ページ読み込み完了時に最初にログイン画面をレンダリング
document.addEventListener('DOMContentLoaded', () => {
    renderLoginScreen();
});
