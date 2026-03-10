import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-primary shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-white">
            LinkUp
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-primary/20">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. 個人情報の収集について</h2>
              <p className="text-gray-600 leading-relaxed">
                LinkUp（以下「本サービス」といいます）は、ユーザーから以下の個人情報を収集することがあります：
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>氏名</li>
                <li>メールアドレス</li>
                <li>学習履歴・進捗データ</li>
                <li>その他、本サービスの利用に必要な情報</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. 個人情報の利用目的</h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                本サービスは、収集した個人情報を以下の目的で利用します：
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>本サービスの提供・運営のため</li>
                <li>ユーザーからのお問い合わせに対応するため</li>
                <li>学習進捗の管理・コーチングサービスの提供のため</li>
                <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
                <li>ユーザーにご自身の登録情報の閲覧や変更を行っていただくため</li>
                <li>上記の利用目的に付随する目的</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. 個人情報の第三者提供</h2>
              <p className="text-gray-600 leading-relaxed">
                本サービスは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、
                第三者に個人情報を提供することはありません：
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、ユーザーの同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、ユーザーの同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、ユーザーの同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. 個人情報の開示</h2>
              <p className="text-gray-600 leading-relaxed">
                本サービスは、ユーザーから個人情報の開示を求められたときは、ユーザーに対し、
                遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、
                その全部または一部を開示しないこともあります：
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>ユーザーまたは第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
                <li>本サービスの運営に著しい支障を及ぼすおそれがある場合</li>
                <li>その他法令に違反することとなる場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. 個人情報の訂正および削除</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ユーザーは、本サービスの保有する自己の個人情報が誤った情報である場合には、
                本サービスが定める手続きにより、個人情報の訂正、追加または削除を請求することができます。
              </p>
              <p className="text-gray-600 leading-relaxed">
                本サービスは、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、
                遅滞なく、当該個人情報の訂正、追加または削除を行うものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. 個人情報の利用停止等</h2>
              <p className="text-gray-600 leading-relaxed">
                本サービスは、ユーザーから、個人情報が利用目的の範囲を超えて取り扱われているという理由、
                または不正の手段により取得されたものであるという理由により、その利用の停止または
                消去（以下「利用停止等」といいます）を求められた場合には、遅滞なく必要な調査を行います。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookieの使用について</h2>
              <p className="text-gray-600 leading-relaxed">
                本サービスでは、ユーザーの利便性向上のため、Cookieを使用することがあります。
                Cookieとは、ウェブサーバーからユーザーのブラウザに送信される小さなデータファイルで、
                ユーザーのコンピューターのハードディスクに保存されます。
                ユーザーはブラウザの設定により、Cookieの受け取りを拒否することができますが、
                その場合、本サービスの一部機能が利用できなくなる場合があります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. セキュリティについて</h2>
              <p className="text-gray-600 leading-relaxed">
                本サービスは、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のために
                必要かつ適切な措置を講じます。また、個人情報を取り扱う従業員や委託先に対して、
                必要かつ適切な監督を行います。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. プライバシーポリシーの変更</h2>
              <p className="text-gray-600 leading-relaxed">
                本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、
                ユーザーに通知することなく、変更することができるものとします。
                変更後のプライバシーポリシーは、本サービス上に表示した時点より効力を生じるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. お問い合わせ窓口</h2>
              <p className="text-gray-600 leading-relaxed">
                本ポリシーに関するお問い合わせは、本サービスのお問い合わせフォームよりご連絡ください。
              </p>
            </section>

            <div className="text-right text-gray-500 text-sm mt-12">
              <p>制定日：2026年1月1日</p>
              <p>最終更新日：2026年1月1日</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-primary-dark hover:text-primary">
            ← トップページに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
