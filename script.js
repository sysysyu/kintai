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

            <!-- エラーメッセージ表示欄 -->
            <div id="errorMessage" class="text-red-600 text-center mb-6 font-medium h-6">
                <!-- エラーメッセージはここに表示されます -->
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
                    <!-- ログインボタン -->
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
                    <input type="text" id="newLoginId" name="newLoginId" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-base focus:outline-none transition duration-150 ease-in-out">
                </div>
                <div>
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">パスワード:</label>
                    <input type="password" id="newPassword" name="newPassword" required class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-base focus:outline-none transition duration-150 ease-in-out">
                </div>
                <div>
                    <button type="submit" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:scale-95">
                        アカウントを作成する
                    </button>
                    <button type="button" id="backToLoginBtn" class="w-full flex justify-center py-2.5 px-4 mt-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:scale-95">
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
    appContainer.classList.add('max-w-screen-lg'); // ワークフロー画面の最大幅を適用
    appContainer.classList.add('p-6'); // ワークフロー画面のパディングを適用

    // 現在のユーザー情報を取得（シミュレーション）
    const currentUser = mockUserInfo.find(user => user.id === 'user123'); // ログインIDが 'user123' のユーザーを仮定
    const userName = currentUser ? `${currentUser.last_name} ${currentUser.first_name}` : 'ゲスト';

    appContainer.innerHTML = `
        <div class="workflow-content">
            <!-- ヘッダー -->
            <header class="header-bg shadow-sm rounded-t-lg p-6 mb-6 flex justify-between items-center flex-wrap">
                <div class="flex-1 min-w-[200px] mb-4 md:mb-0">
                    <h1 class="text-3xl font-bold text-gray-900">ようこそ、${userName}様</h1>
                    <p class="text-lg text-gray-600 mt-1">実行したいワークフローを選択してください。</p>
                </div>
                <div class="flex items-center space-x-4 min-w-[200px] justify-end">
                    <span class="text-gray-500 text-sm">ユーザーID: ${currentUser.id}</span>
                    <button id="logoutButton" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out">
                        ログアウト
                    </button>
                </div>
            </header>

            <!-- ワークフロー一覧 -->
            <main class="dynamic-area-bg p-6 rounded-b-lg shadow-inner">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="workflowList">
                    <!-- ワークフローカードはJSで動的に生成されます -->
                </div>
            </main>
        </div>
    `;

    const workflowList = document.getElementById('workflowList');
    const logoutButton = document.getElementById('logoutButton');

    // ワークフローカードを動的に生成
    mockWorkflows.forEach(workflow => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center';
        card.dataset.id = workflow.id;

        const icon = document.createElement('div');
        icon.className = 'text-4xl text-indigo-600 mb-4';
        // ワークフローIDに基づいてアイコンを決定
        switch(workflow.id) {
            case 'wf1_attendance':
                icon.innerHTML = '📝'; // 勤怠
                break;
            case 'wf2_purchase':
                icon.innerHTML = '🛒'; // 購入
                break;
            case 'wf3_certificate':
                icon.innerHTML = '📜'; // 資格
                break;
            case 'wf4_dependent':
                icon.innerHTML = '👨‍👩‍👧‍👦'; // 扶養
                break;
            case 'wf5_month_end':
                icon.innerHTML = '🗓️'; // 月末
                break;
            case 'wf6_address_change':
                icon.innerHTML = '🏠'; // 住所変更
                break;
            default:
                icon.innerHTML = '⚙️'; // デフォルト
                break;
        }

        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold text-gray-800';
        title.textContent = workflow.frow_name;

        card.appendChild(icon);
        card.appendChild(title);
        workflowList.appendChild(card);

        // 各カードにクリックイベントリスナーを追加
        card.addEventListener('click', () => {
            handleWorkflowSelection(workflow.id);
        });
    });

    logoutButton.addEventListener('click', () => {
        showMessage('ログアウトしました。', 'success');
        setTimeout(renderLoginScreen, 1000);
    });
}

/**
 * ワークフロー選択時の処理
 * @param {string} workflowId - 選択されたワークフローのID
 */
function handleWorkflowSelection(workflowId) {
    console.log(`ワークフローID: ${workflowId} が選択されました。`);
    // ここで選択されたワークフローに応じたフォームをレンダリングする
    if (workflowId === 'wf6_address_change') {
        renderAddressChangeForm();
    } else {
        openMessageModal('ワークフローは準備中です', 'このワークフローはまだ開発中です。他のワークフローを選択してください。', () => {}, false);
    }
}

/**
 * 住所変更フォームをレンダリングする関数
 */
function renderAddressChangeForm() {
    const mainContent = appContainer.querySelector('.dynamic-area-bg');
    if (!mainContent) {
        console.error('メインコンテンツエリアが見つかりません。');
        return;
    }

    mainContent.innerHTML = `
        <div id="addressChangeFormContent" class="p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-indigo-500 pb-2">住所変更申請</h2>

            <form id="addressChangeForm" class="space-y-6">
                <!-- 郵便番号入力欄 -->
                <div class="form-group">
                    <label for="postalCode" class="label">郵便番号</label>
                    <div class="zip-code-group">
                        <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            placeholder="例: 123-4567"
                            maxlength="8"
                            required
                            class="rounded-lg"
                        >
                        <button type="button" id="searchAddressBtn" class="bg-blue-600 text-white rounded-lg hover:bg-blue-700 px-4 py-2 transition-colors duration-200">
                            住所検索
                        </button>
                    </div>
                </div>

                <!-- 都道府県入力欄 -->
                <div class="form-group">
                    <label for="prefecture" class="label">都道府県</label>
                    <input type="text" id="prefecture" name="prefecture" required class="rounded-lg">
                </div>

                <!-- 市区町村入力欄 -->
                <div class="form-group">
                    <label for="city" class="label">市区町村</label>
                    <input type="text" id="city" name="city" required class="rounded-lg">
                </div>

                <!-- 番地以降入力欄 -->
                <div class="form-group">
                    <label for="street" class="label">番地以降</label>
                    <input type="text" id="street" name="street" required class="rounded-lg">
                </div>

                <!-- 建物名・部屋番号入力欄 -->
                <div class="form-group">
                    <label for="building" class="label">建物名・部屋番号</label>
                    <input type="text" id="building" name="building" class="rounded-lg">
                </div>

                <!-- 申請日 -->
                <div class="form-group">
                    <label for="applicationDate" class="label">申請日</label>
                    <input type="date" id="applicationDate" name="applicationDate" required class="rounded-lg">
                </div>

                <!-- 申請理由 -->
                <div class="form-group">
                    <label for="reason" class="label">申請理由</label>
                    <textarea id="reason" name="reason" rows="4" required class="rounded-lg"></textarea>
                </div>

                <!-- 送信ボタン -->
                <div class="flex justify-end space-x-4 pt-4">
                    <button type="button" id="backToWorkflowsBtn"
                            class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200">
                        ワークフロー一覧に戻る
                    </button>
                    <button type="submit" id="submitAddressChangeBtn"
                            class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                        入力内容を確認
                    </button>
                </div>
            </form>
        </div>
    `;

    const addressChangeForm = document.getElementById('addressChangeForm');
    const backToWorkflowsBtn = document.getElementById('backToWorkflowsBtn');
    const searchAddressBtn = document.getElementById('searchAddressBtn');
    const postalCodeInput = document.getElementById('postalCode');
    const prefectureInput = document.getElementById('prefecture');
    const cityInput = document.getElementById('city');
    const streetInput = document.getElementById('street');

    // ワークフロー一覧に戻るボタンのイベントリスナー
    backToWorkflowsBtn.addEventListener('click', () => {
        renderWorkflowScreen();
    });

    // 郵便番号検索ボタンのイベントリスナー (モック)
    searchAddressBtn.addEventListener('click', () => {
        const postalCode = postalCodeInput.value.replace(/-/g, ''); // ハイフンを除去
        if (postalCode.length !== 7) {
            showMessage('郵便番号は7桁で入力してください。', 'error');
            return;
        }

        // 郵便番号検索APIのモック
        console.log(`郵便番号 ${postalCode} で住所を検索中...`);
        // 実際のAPI呼び出しの代わりに、固定の住所データを設定
        prefectureInput.value = '東京都';
        cityInput.value = '千代田区';
        streetInput.value = '丸の内';
        showMessage('住所が自動入力されました。', 'success');
    });

    // 住所変更フォームの送信イベントリスナー
    addressChangeForm.addEventListener('submit', function(event) {
        event.preventDefault(); // フォームのデフォルト送信を防止

        // バリデーション
        const isFormValid = addressChangeForm.checkValidity();
        if (isFormValid) {
            // 確認モーダル用のコンテンツを生成
            const formData = new FormData(addressChangeForm);
            let confirmContentHtml = '<p>以下の内容で申請します。よろしいですか？</p><ul class="list-disc list-inside mt-4 space-y-1">';
            formData.forEach((value, key) => {
                let label = '';
                switch(key) {
                    case 'postalCode': label = '郵便番号'; break;
                    case 'prefecture': label = '都道府県'; break;
                    case 'city': label = '市区町村'; break;
                    case 'street': label = '番地以降'; break;
                    case 'building': label = '建物名・部屋番号'; break;
                    case 'applicationDate': label = '申請日'; break;
                    case 'reason': label = '申請理由'; break;
                    default: label = key;
                }
                confirmContentHtml += `<li class="font-medium text-gray-700"><span class="text-gray-500">${label}：</span><span class="font-normal">${value}</span></li>`;
            });
            confirmContentHtml += '</ul>';

            openConfirmationModal('入力内容の確認', confirmContentHtml, () => {
                // 送信処理のシミュレーション
                console.log('住所変更データを最終送信中...');
                const dataToSend = {
                    postalCode: formData.get('postalCode'),
                    prefecture: formData.get('prefecture'),
                    city: formData.get('city'),
                    street: formData.get('street'),
                    building: formData.get('building'),
                    applicationDate: formData.get('applicationDate'),
                    reason: formData.get('reason'),
                };

                // サーバーにデータを送信するシミュレーション (ここではコンソールに出力)
                console.log('送信データ:', dataToSend);
                showMessage('送信成功', '住所変更データを最終送信しました！', () => {
                    clearFormInputs(addressChangeForm);
                    // オプションでワークフローに戻る
                    renderWorkflowScreen();
                });
            }, () => {
                // 修正ボタンが押された場合、何もしない
            });
        } else {
            openMessageModal('入力エラー', '入力に不備があります。必須項目を確認してください。', () => {}, true);
        }
    });

    /**
     * フォームの入力内容をクリアする関数
     * @param {HTMLFormElement} form - クリアするフォーム要素
     */
    function clearFormInputs(form) {
        form.reset();
    }
}


/**
 * ページ読み込み完了時に最初にログイン画面をレンダリング
 */
document.addEventListener('DOMContentLoaded', () => {
    renderLoginScreen();
});
