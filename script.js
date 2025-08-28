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
    // ... (中略 - app-containerのスタイル設定は変更なし)

appContainer.innerHTML = `
        <div class="login-content">
            <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">システムログイン</h2>

            <div id="errorMessage" class="text-red-600 text-center mb-6 font-medium h-6">
                </div>

            <form id="loginForm" class="space-y-6" novalidate>
                
                {*--- 以下の部分が前回欠落していました ---*}
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
                {*--- ここまで ---*}

                <div>
                    <button
                        type="submit"
                        id="loginButton"
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:scale-95"
                    >
                        ログイン
                    </button>
                </div>
            </form>
        </div>
    `;

    const loginForm = document.getElementById('loginForm');
    const loginIdInput = document.getElementById('loginId');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('errorMessage');

    // ログイン処理のシミュレーション
    const validLoginId = 'jqit@gmail.com';
    const validPassword = 'password';

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // フォームのデフォルト送信を防止

        errorMessageDiv.textContent = ''; // エラーメッセージをクリア

        const loginId = loginIdInput.value.trim();
        const password = passwordInput.value.trim();

        // ログインIDとパスワードの有効性をチェック
        const isLoginIdValid = loginId === validLoginId;
        const isPasswordValid = password === validPassword;
        const isLoginIdEmpty = loginId === '';
        const isPasswordEmpty = password === '';

        let errorMessage = '';

        if (isLoginIdEmpty && isPasswordEmpty) {
            errorMessage = 'メールアドレスとパスワードを入力してください。';
        } else if (isLoginIdEmpty) {
            errorMessage = 'メールアドレスが入力されていません。メールアドレスを入力してください。';
        } else if (isPasswordEmpty) {
            errorMessage = 'パスワードが入力されていません。パスワードを入力してください。';
        } else if (isLoginIdValid && !isPasswordValid) {
            errorMessage = 'パスワードが無効です。';
        } else if (!isLoginIdValid && isPasswordValid) {
            errorMessage = 'メールアドレスが無効です。有効なメールアドレスを入力してください。';
        } else if (!isLoginIdValid && !isPasswordValid) {
            errorMessage = 'メールアドレスとパスワードの両方が無効です。';
        }

        // エラーメッセージの表示またはログイン成功処理
        if (errorMessage) {
            errorMessageDiv.textContent = errorMessage;
            // 💡 変更箇所: openMessageModal の呼び出しを削除
            // openMessageModal('入力エラー', errorMessage, () => {}, true);
        } else {
            // 両方有効な場合
            // ログイン成功時は引き続き showMessage を使用 (これはページ上部のモーダルではなく、画面中央のメッセージモーダル)
            openMessageModal('ログイン成功', 'ワークフロー申請画面へ遷移します。', () => {
                renderWorkflowScreen();
            });
            // 💡 変更箇所: showMessage を openMessageModal に置き換え、setTimeout を削除
            // showMessage('ログイン成功！ワークフロー申請画面へ遷移します。', 'success');
            // setTimeout(() => {
            //     renderWorkflowScreen();
            // }, 1000); // メッセージ表示後に遷移
        }
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
 */
function loadWorkflowContent(workflowId) {
    const dynamicWorkflowArea = document.getElementById('dynamicWorkflowArea');
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
                            <button type="button" id="submitButton_attendance"
                                    class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
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
                            <button type="button" id="addCandidateBtn"
                                    class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out">
                                候補数追加
                            </button>
                            <button type="submit"
                                    class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
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
            break;
        case 'wf3_certificate':
            contentHtml = `
                <div class="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">資格申請</h1>
                    <form id="certificate-form" class="space-y-6">
                        <div class="form-group">
                            <label for="certificateName" class="block text-sm font-medium text-gray-700 mb-1">
                                資格名 <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="certificateName" name="certificateName" required
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-base">
                        </div>
                        <div class="form-group">
                            <label for="acquisitionDate" class="block text-sm font-medium text-gray-700 mb-1">
                                取得日 <span class="text-red-500">*</span>
                            </label>
                            <input type="date" id="acquisitionDate" name="acquisitionDate" required
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-base">
                        </div>
                        <div class="form-group">
                            <label for="issuingAuthority" class="block text-sm font-medium text-gray-700 mb-1">
                                発行団体
                            </label>
                            <input type="text" id="issuingAuthority" name="issuingAuthority"
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-base">
                        </div>
                        <div class="form-group">
                            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                                備考
                            </label>
                            <textarea id="notes" name="notes" rows="4"
                                      class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 text-base"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="certificateFile" class="block text-sm font-medium text-gray-700 mb-1">
                                添付ファイル
                            </label>
                            <input type="file" id="certificateFile" name="certificateFile"
                                   class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                        </div>
                        <div class="flex justify-center mt-6">
                            <button type="submit"
                                    class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            break;
        case 'wf4_dependent':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">扶養届け</h1>
                    <form id="dependent-form" class="space-y-6">
                        <div class="form-group">
                            <label for="dependentName" class="block text-sm font-medium text-gray-700 mb-1">
                                扶養者の氏名 <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="dependentName" name="dependentName" required
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="form-group">
                            <label for="relationship" class="block text-sm font-medium text-gray-700 mb-1">
                                本人との関係 <span class="text-red-500">*</span>
                            </label>
                            <select id="relationship" name="relationship" required
                                    class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="">選択してください</option>
                                <option value="配偶者">配偶者</option>
                                <option value="子">子</option>
                                <option value="親">親</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="dependentBirthDate" class="block text-sm font-medium text-gray-700 mb-1">
                                生年月日 <span class="text-red-500">*</span>
                            </label>
                            <input type="date" id="dependentBirthDate" name="dependentBirthDate" required
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="form-group">
                            <label for="dependentFile" class="block text-sm font-medium text-gray-700 mb-1">
                                添付ファイル
                            </label>
                            <input type="file" id="dependentFile" name="dependentFile"
                                   class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                        </div>
                        <div class="flex justify-center mt-6">
                            <button type="submit"
                                    class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            break;
        case 'wf5_month_end':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">月末処理</h1>
                    <form id="monthEnd-form" class="space-y-6">
                        <div class="form-group">
                            <label for="processingMonth" class="block text-sm font-medium text-gray-700 mb-1">
                                対象年月 <span class="text-red-500">*</span>
                            </label>
                            <input type="month" id="processingMonth" name="processingMonth" required
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div class="form-group">
                            <label for="reportFile" class="block text-sm font-medium text-gray-700 mb-1">
                                報告書ファイル
                            </label>
                            <input type="file" id="reportFile" name="reportFile"
                                   class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                        </div>
                        <div class="form-group">
                            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">
                                備考
                            </label>
                            <textarea id="notes" name="notes" rows="4"
                                      class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        <div class="flex justify-center mt-6">
                            <button type="submit"
                                    class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            break;
        case 'wf6_address_change':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">住所変更</h1>
                    <form id="addressChangeForm" class="space-y-6">
                        <div class="form-group">
                            <label for="postalCode" class="block text-sm font-medium text-gray-700 mb-1">
                                郵便番号 <span class="text-red-500">*</span>
                            </label>
                            <div class="zip-code-group mt-1">
                                <input type="text" id="postalCode" name="postalCode" placeholder="例: 1000001" maxlength="7" required
                                       class="block flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base">
                                <button type="button" id="searchAddressBtn"
                                        class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out">
                                    住所検索
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="prefecture" class="block text-sm font-medium text-gray-700 mb-1">
                                都道府県 <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="prefecture" name="prefecture" required
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base">
                        </div>
                        <div class="form-group">
                            <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
                                市区町村 <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="city" name="city" required
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base">
                        </div>
                        <div class="form-group">
                            <label for="street" class="block text-sm font-medium text-gray-700 mb-1">
                                番地 <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="street" name="street" required
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base">
                        </div>
                        <div class="form-group">
                            <label for="building" class="block text-sm font-medium text-gray-700 mb-1">
                                建物名・部屋番号 (任意)
                            </label>
                            <input type="text" id="building" name="building"
                                   class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base">
                        </div>
                        <div class="flex justify-center mt-6">
                            <button type="submit"
                                    class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            break;
        default:
            contentHtml = `<p class="font-bold text-lg mb-4">ここより下はワークフローの種類により変動する</p>
                           <div id="dynamicContent" class="text-gray-800 text-xl font-medium">
                               選択されたワークフローは見つかりません。
                           </div>`;
            break;
    }
    // コンテンツを挿入
    dynamicWorkflowArea.innerHTML = contentHtml;

    // 💡 修正ポイント：HTMLコンテンツが挿入された後に、イベントリスナーを登録する
    switch (workflowId) {
        case 'wf1_attendance':
            addAttendanceFormListeners();
            break;
        case 'wf2_purchase':
            addSubscriptionFormListeners();
            break;
        case 'wf3_certificate':
            addCertificateFormListeners();
            break;
        case 'wf4_dependent':
            addDependentFormListeners();
            break;
        case 'wf5_month_end':
            addMonthEndFormListeners();
            break;
        case 'wf6_address_change':
            addAddressChangeFormListeners();
            break;
    }
}


// 各フォームのイベントリスナー設定関数

function addAttendanceFormListeners() {
    const attendanceForm = document.getElementById('attendanceForm');
    const reasonTypeRadios = document.getElementsByName('reasonType');
    const lateTimeSection = document.getElementById('lateTimeSection');
    const earlyLeaveTimeSection = document.getElementById('earlyLeaveTimeSection');
    const substituteDateSection = document.getElementById('substituteDateSection');
    const lateTimeSelect = document.getElementById('lateTime');
    const submitButton = document.getElementById('submitButton_attendance');

    // 初期表示設定
    updateAttendanceFormSections();
    generateLateTimeOptions();

    // 理由の選択が変更されたときの処理
    reasonTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateAttendanceFormSections);
    });

    function updateAttendanceFormSections() {
        const selectedReason = document.querySelector('input[name="reasonType"]:checked').value;
        const reasonSections = {
            '0': [], // 有給
            '1': [substituteDateSection], // 代休
            '2': [], // 欠勤
            '3': [lateTimeSection], // 遅刻
            '4': [earlyLeaveTimeSection], // 早退
            '5': [], // 中抜け
            '6': [] // 忌引き
        };

        // すべてのセクションを非表示にする
        Object.values(reasonSections).flat().forEach(section => {
            if (section) section.classList.add('hidden');
        });

        // 選択された理由に対応するセクションを表示する
        if (reasonSections[selectedReason]) {
            reasonSections[selectedReason].forEach(section => {
                if (section) section.classList.remove('hidden');
            });
        }
    }

    function generateLateTimeOptions() {
        lateTimeSelect.innerHTML = '<option value="">選択してください</option>';
        for (let i = 1; i <= 60; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}分`;
            lateTimeSelect.appendChild(option);
        }
    }

    if (submitButton) {
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            const contactDate = document.getElementById('contactDate').value;
            const reasonType = document.querySelector('input[name="reasonType"]:checked').value;
            const lateTime = document.getElementById('lateTime').value;
            const earlyLeaveTime = document.getElementById('earlyLeaveTime').value;
            const substituteDate = document.getElementById('substituteDate').value;
            const reason = document.getElementById('reason').value;

            // バリデーション
            let hasError = false;
            if (!contactDate) {
                document.getElementById('contactDateError').textContent = '連絡日付は必須です。';
                document.getElementById('contactDateError').classList.remove('hidden');
                hasError = true;
            } else {
                document.getElementById('contactDateError').classList.add('hidden');
            }

            if (reasonType === '3' && !lateTime) {
                openMessageModal('入力エラー', '遅刻時間が選択されていません。', () => {}, true);
                return;
            }

            if (reasonType === '4' && !earlyLeaveTime) {
                openMessageModal('入力エラー', '早退時間が入力されていません。', () => {}, true);
                return;
            }

            if (reasonType === '1' && !substituteDate) {
                openMessageModal('入力エラー', '代休消化日が入力されていません。', () => {}, true);
                return;
            }

            if (hasError) {
                openMessageModal('入力エラー', '入力に不備があります。必須項目を確認してください。', () => {}, true);
                return;
            }

            // 確認モーダル用のコンテンツを生成
            const confirmHtml = `
                <div class="space-y-2">
                    <p><strong>連絡日付:</strong> ${contactDate}</p>
                    <p><strong>事由:</strong> ${getReasonText(reasonType)}</p>
                    ${reasonType === '3' ? `<p><strong>遅刻時間:</strong> ${lateTime}分</p>` : ''}
                    ${reasonType === '4' ? `<p><strong>早退時間:</strong> ${earlyLeaveTime}</p>` : ''}
                    ${reasonType === '1' ? `<p><strong>代休消化日:</strong> ${substituteDate}</p>` : ''}
                    ${reason ? `<p><strong>理由:</strong> ${reason}</p>` : ''}
                </div>
            `;
            openConfirmationModal('勤怠連絡の確認', confirmHtml, () => {
                // 送信処理（ここでは成功メッセージを表示）
                openMessageModal('送信成功', '勤怠連絡が正常に送信されました！', () => {
                    // フォームをリセット
                    attendanceForm.reset();
                    updateAttendanceFormSections(); // フォームリセット後にセクション表示も更新
                });
            }, () => {
                // 修正ボタンが押された場合、何もしない
            });
        });
    }
}

function getReasonText(reasonValue) {
    const reasons = {
        '0': '有給',
        '1': '代休',
        '2': '欠勤',
        '3': '遅刻',
        '4': '早退',
        '5': '中抜け',
        '6': '忌引き'
    };
    return reasons[reasonValue] || '';
}

function addSubscriptionFormListeners() {
    const subscriptionForm = document.getElementById('subscription-form');
    const routeOptionsContainer = document.getElementById('route-options');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    let candidateCount = 1;

    // ワークフローに戻るボタンのイベントリスナー
    const backToWorkflowBtn = document.querySelector('#subscription-form .back-to-workflow-btn');
    if (backToWorkflowBtn) {
        backToWorkflowBtn.addEventListener('click', () => {
            document.getElementById('workflowType').value = "";
            renderWorkflowScreen();
        });
    }


    addCandidateBtn.addEventListener('click', () => {
        candidateCount++;
        const newCandidateHtml = `
            <div class="route-option p-4 border border-dashed border-gray-300 rounded-md">
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
                    <div class="error-message" id="commuteTime${candidateCount}-error"></div>
                </div>
                <div class="form-group">
                    <label for="amount${candidateCount}">金額:</label>
                    <input type="number" id="amount${candidateCount}" name="amount[]" required class="w-full">
                    <div class="error-message" id="amount${candidateCount}-error"></div>
                </div>
            </div>
        `;
        routeOptionsContainer.insertAdjacentHTML('beforeend', newCandidateHtml);
    });

    subscriptionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // エラーメッセージをリセット
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        const formData = new FormData(subscriptionForm);
        let isValid = true;

        const subscriptionDate = formData.get('subscriptionDate');
        const nearestStation = formData.get('nearestStation');
        if (!subscriptionDate) {
            document.getElementById('subscriptionDate-error').textContent = '定期購入日は必須です。';
            isValid = false;
        }
        if (!nearestStation) {
            document.getElementById('nearestStation-error').textContent = '最寄り駅は必須です。';
            isValid = false;
        }

        const transitStations = formData.getAll('transitStation[]');
        const commuteTimes = formData.getAll('commuteTime[]');
        const amounts = formData.getAll('amount[]');

        for (let i = 0; i < amounts.length; i++) {
            if (!amounts[i]) {
                document.getElementById(`amount${i + 1}-error`).textContent = `候補 ${i + 1} の金額は必須です。`;
                isValid = false;
            }
            if (!commuteTimes[i]) {
                document.getElementById(`commuteTime${i + 1}-error`).textContent = `候補 ${i + 1} の通勤時間は必須です。`;
                isValid = false;
            }
        }

        if (!isValid) {
            openMessageModal('入力エラー', '入力に不備があります。必須項目を確認してください。', () => {}, true);
            return;
        }

        let confirmHtml = `
            <div class="space-y-2">
                <p><strong>定期購入日:</strong> ${subscriptionDate}</p>
                <p><strong>最寄り駅:</strong> ${nearestStation}</p>
                <p><strong>目的駅:</strong> ${formData.get('destinationStation')}</p>
                <h3 class="font-bold mt-4">購入経路:</h3>
            </div>
            <ul class="list-disc list-inside space-y-2 mt-2">
        `;
        for (let i = 0; i < amounts.length; i++) {
            confirmHtml += `
                <li>
                    <strong>候補 ${i + 1}:</strong><br>
                    経由駅: ${transitStations[i] || 'なし'}<br>
                    通勤時間: ${commuteTimes[i]}<br>
                    金額: ${amounts[i]}円
                </li>
            `;
        }
        confirmHtml += '</ul>';

        openConfirmationModal('定期購入申請の確認', confirmHtml, () => {
            // 送信処理
            const dataToSend = {
                subscriptionDate: subscriptionDate,
                nearestStation: nearestStation,
                destinationStation: formData.get('destinationStation'),
                routes: amounts.map((amount, i) => ({
                    transitStation: transitStations[i] || null,
                    commuteTime: commuteTimes[i],
                    amount: amount
                }))
            };
            console.log('送信データ:', dataToSend);
            openMessageModal('送信成功', '定期購入申請を最終送信しました！', () => {
                subscriptionForm.reset();
            });
        }, () => {
            // Cancel handler - no action needed
        });
    });
}


function addCertificateFormListeners() {
    const form = document.getElementById('certificate-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const certificateName = document.getElementById('certificateName').value;
        const acquisitionDate = document.getElementById('acquisitionDate').value;

        if (!certificateName || !acquisitionDate) {
            openMessageModal('入力エラー', '資格名と取得日は必須項目です。', () => {}, true);
            return;
        }

        const formData = new FormData(form);
        const confirmHtml = `
            <div class="space-y-2">
                <p><strong>資格名:</strong> ${formData.get('certificateName')}</p>
                <p><strong>取得日:</strong> ${formData.get('acquisitionDate')}</p>
                <p><strong>発行団体:</strong> ${formData.get('issuingAuthority') || '未入力'}</p>
                <p><strong>備考:</strong> ${formData.get('notes') || '未入力'}</p>
                <p><strong>添付ファイル:</strong> ${formData.get('certificateFile')?.name || 'なし'}</p>
            </div>
        `;

        openConfirmationModal('資格申請の確認', confirmHtml, () => {
            console.log('Form Data:', Object.fromEntries(formData.entries()));
            openMessageModal('送信成功', '資格申請を最終送信しました！', () => {
                form.reset();
            });
        }, () => {});
    });
}

function addDependentFormListeners() {
    const form = document.getElementById('dependent-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const dependentName = document.getElementById('dependentName').value;
        const relationship = document.getElementById('relationship').value;
        const dependentBirthDate = document.getElementById('dependentBirthDate').value;

        if (!dependentName || !relationship || !dependentBirthDate) {
            openMessageModal('入力エラー', 'すべての必須項目を入力してください。', () => {}, true);
            return;
        }

        const formData = new FormData(form);
        const confirmHtml = `
            <div class="space-y-2">
                <p><strong>扶養者の氏名:</strong> ${formData.get('dependentName')}</p>
                <p><strong>本人との関係:</strong> ${formData.get('relationship')}</p>
                <p><strong>生年月日:</strong> ${formData.get('dependentBirthDate')}</p>
                <p><strong>添付ファイル:</strong> ${formData.get('dependentFile')?.name || 'なし'}</p>
            </div>
        `;

        openConfirmationModal('扶養届けの確認', confirmHtml, () => {
            console.log('Form Data:', Object.fromEntries(formData.entries()));
            openMessageModal('送信成功', '扶養届けを最終送信しました！', () => {
                form.reset();
            });
        }, () => {});
    });
}

function addMonthEndFormListeners() {
    const form = document.getElementById('monthEnd-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const processingMonth = document.getElementById('processingMonth').value;

        if (!processingMonth) {
            openMessageModal('入力エラー', '対象年月は必須項目です。', () => {}, true);
            return;
        }

        const formData = new FormData(form);
        const confirmHtml = `
            <div class="space-y-2">
                <p><strong>対象年月:</strong> ${formData.get('processingMonth')}</p>
                <p><strong>報告書ファイル:</strong> ${formData.get('reportFile')?.name || 'なし'}</p>
                <p><strong>備考:</strong> ${formData.get('notes') || '未入力'}</p>
            </div>
        `;

        openConfirmationModal('月末処理申請の確認', confirmHtml, () => {
            console.log('Form Data:', Object.fromEntries(formData.entries()));
            openMessageModal('送信成功', '月末処理申請を最終送信しました！', () => {
                form.reset();
            });
        }, () => {});
    });
}


function addAddressChangeFormListeners() {
    const form = document.getElementById('addressChangeForm');
    const postalCodeInput = document.getElementById('postalCode');
    const searchAddressBtn = document.getElementById('searchAddressBtn');
    const prefectureInput = document.getElementById('prefecture');
    const cityInput = document.getElementById('city');
    const streetInput = document.getElementById('street');

    // 住所検索ボタンのイベントリスナー
    if (searchAddressBtn) {
        searchAddressBtn.addEventListener('click', async () => {
            const postalCode = postalCodeInput.value.replace('-', '');
            if (postalCode.length !== 7 || !/^\d{7}$/.test(postalCode)) {
                openMessageModal('入力エラー', '7桁の半角数字で郵便番号を入力してください。', () => {}, true);
                return;
            }

            try {
                // ここではモックデータを使用
                const mockAddress = {
                    '1000001': { prefecture: '東京都', city: '千代田区', street: '千代田' },
                    '5300001': { prefecture: '大阪府', city: '大阪市北区', street: '梅田' },
                };
                const addressData = mockAddress[postalCode] || null;

                if (addressData) {
                    prefectureInput.value = addressData.prefecture;
                    cityInput.value = addressData.city;
                    streetInput.value = addressData.street;
                } else {
                    openMessageModal('検索失敗', '指定された郵便番号の住所が見つかりませんでした。', () => {}, true);
                }
            } catch (error) {
                console.error('住所検索エラー:', error);
                openMessageModal('通信エラー', '住所検索中にエラーが発生しました。', () => {}, true);
            }
        });
    }

    // フォーム送信イベントリスナー
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const requiredFields = ['postalCode', 'prefecture', 'city', 'street'];
        let allFieldsFilled = true;
        requiredFields.forEach(id => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                allFieldsFilled = false;
            }
        });

        if (!allFieldsFilled) {
            openMessageModal('入力エラー', 'すべての必須項目を入力してください。', () => {}, true);
            return;
        }

        const formData = new FormData(form);
        const confirmHtml = `
            <div class="space-y-2">
                <p><strong>郵便番号:</strong> ${formData.get('postalCode')}</p>
                <p><strong>住所:</strong> ${formData.get('prefecture')}${formData.get('city')}${formData.get('street')}</p>
                <p><strong>建物名・部屋番号:</strong> ${formData.get('building') || '未入力'}</p>
            </div>
        `;
        openConfirmationModal('住所変更申請の確認', confirmHtml, async () => {
            const dataToSend = {
                postalCode: formData.get('postalCode'),
                prefecture: formData.get('prefecture'),
                city: formData.get('city'),
                street: formData.get('street'),
                building: formData.get('building') || null,
            };
            console.log('Final Data to send:', dataToSend);
            try {
                // 実際のAPI通信の代わりにシミュレーション
                const response = await fetch('https://example.com/api/submit-address', {
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
    });
}

function clearFormInputs(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'file') {
            input.value = ''; // ファイル入力の値をクリア
        } else if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false; // チェックボックスとラジオボタンをクリア
        } else {
            input.value = ''; // それ以外の入力をクリア
        }
    });
}


// ページ読み込み完了時に最初にログイン画面をレンダリング
document.addEventListener('DOMContentLoaded', () => {
    renderLoginScreen();
});
