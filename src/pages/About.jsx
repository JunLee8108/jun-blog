import { Squiggle } from '../components/Doodles'
import usePageTitle from '../hooks/usePageTitle'

export default function About() {
  usePageTitle('소개')

  return (
    <>
      <header className="mb-10">
        <h1 className="text-2xl font-semibold text-ink">소개</h1>
        <Squiggle className="mt-2 h-2.5 w-20 text-clay/60" />
      </header>
      <div className="prose max-w-none">
        <p>
          안녕하세요, <strong>Jun</strong>입니다.
        </p>
        <p>
          이 블로그는 일상 속 생각들과 개발하면서 배운 것들을 기록하는 공간이에요.
          거창한 글보다는, 나중에 다시 읽었을 때 그때의 제가 떠오르는 글을 남기고
          싶습니다.
        </p>
      </div>
    </>
  )
}
