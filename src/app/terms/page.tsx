import Link from 'next/link';

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
              <p className="text-gray-600 leading-relaxed">
                本規約は、LinkUp（以下「本サービス」といいます）の利用に関する条件を、
                本サービスを利用するすべてのユーザー（以下「ユーザー」といいます）と
                本サービスの運営者との間で定めるものです。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第2条（利用登録）</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                登録希望者が本規約に同意の上、所定の方法によって利用登録を申請し、
                運営者がこれを承認することによって、利用登録が完了するものとします。
              </p>
              <p className="text-gray-600 leading-relaxed">
                運営者は、以下の場合には登録を拒否することがあります：
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、運営者が利用登録を相当でないと判断した場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条（ユーザーIDおよびパスワードの管理）</h2>
              <p className="text-gray-600 leading-relaxed">
                ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを
                適切に管理するものとします。ユーザーは、いかなる場合にも、ユーザーIDおよび
                パスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第4条（禁止事項）</h2>
              <p className="text-gray-600 leading-relaxed mb-2">
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>運営者、他のユーザー、またはその他第三者の知的財産権等を侵害する行為</li>
                <li>本サービスの運営を妨害するおそれのある行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>不正な目的を持って本サービスを利用する行為</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第5条（本サービスの提供の停止等）</h2>
              <p className="text-gray-600 leading-relaxed">
                運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく
                本サービスの全部または一部の提供を停止または中断することができるものとします：
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第6条（利用制限および登録抹消）</h2>
              <p className="text-gray-600 leading-relaxed">
                運営者は、ユーザーが本規約のいずれかの条項に違反した場合、事前の通知なく、
                当該ユーザーに対して本サービスの全部もしくは一部の利用を制限し、
                またはユーザーとしての登録を抹消することができるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第7条（退会）</h2>
              <p className="text-gray-600 leading-relaxed">
                ユーザーは、運営者の定める退会手続により、本サービスから退会できるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第8条（保証の否認および免責事項）</h2>
              <p className="text-gray-600 leading-relaxed">
                運営者は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも
                保証しておりません。運営者は、本サービスに起因してユーザーに生じたあらゆる損害について、
                運営者の故意又は重過失による場合を除き、一切の責任を負いません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第9条（サービス内容の変更等）</h2>
              <p className="text-gray-600 leading-relaxed">
                運営者は、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または
                廃止することがあり、ユーザーはこれを承諾するものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第10条（利用規約の変更）</h2>
              <p className="text-gray-600 leading-relaxed">
                運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を
                変更することができるものとします。変更後の利用規約は、本サービス上に表示した
                時点より効力を生じるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第11条（準拠法・裁判管轄）</h2>
              <p className="text-gray-600 leading-relaxed">
                本規約の解釈にあたっては、日本法を準拠法とします。
                本サービスに関して紛争が生じた場合には、運営者の本店所在地を管轄する
                裁判所を専属的合意管轄とします。
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
