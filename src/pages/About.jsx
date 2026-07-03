import usePageTitle from '../hooks/usePageTitle'

export default function About() {
  usePageTitle('소개')

  return (
    <div className="prose prose-neutral dark:prose-invert">
      <h1>소개</h1>
      <p>
        안녕하세요, <strong>Jun</strong>입니다.
      </p>
      <p>
        이 블로그는 일상 속 생각들과 개발하면서 배운 것들을 기록하는 공간입니다.
        거창한 글보다는 나중에 다시 읽었을 때 그때의 제가 떠오르는 글을 남기고
        싶습니다.
      </p>
      <h2>여기에 담는 것들</h2>
      <ul>
        <li>일상의 기록과 생각들</li>
        <li>개발하면서 배우고 삽질한 것들</li>
        <li>읽은 것, 본 것, 좋았던 것</li>
      </ul>
      <h2>연락</h2>
      <p>
        <a href="mailto:lejhn1@gmail.com">lejhn1@gmail.com</a> 으로 편하게 연락
        주세요.
      </p>
    </div>
  )
}
