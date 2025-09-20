import { Input } from "@/components/ui/input"
import { FormEvent, useEffect, useState } from "react"
import { MdSend } from "react-icons/md"
import { characters, properties } from "@/commons/hiraishindle-data"
import { cn } from "@/lib/utils"
import { MdArrowDownward, MdArrowUpward } from "react-icons/md"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useOutsideClick } from "@/hooks/mouse-handler"

const getRandomValueByDay = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let seed = today.getTime()

  const randomIndex = (seed: number): number => {
    const x = Math.sin(seed++) * 10000
    const s = x - Math.floor(x)
    return Math.floor(s * characters.length)
  }

  let todayRandomIndex

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayRandomIndex = randomIndex(yesterday.getTime())

  do {
    todayRandomIndex = randomIndex(seed)
    seed += 1
  } while (todayRandomIndex === yesterdayRandomIndex)

  return characters[todayRandomIndex]
}

const CHOSEN = getRandomValueByDay()

export default function Hiraishindle() {
  const [text, setText] = useState<string>("")
  const [answers, setAnswers] = useState<string[]>([])
  const [isFishined, setIsFinished] = useState<boolean>()
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>()
  const selectRef = useOutsideClick(() => setIsSelectOpen(false))
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([])

  const chosenCharacter = characters.find((character) => character.name === CHOSEN.name)!
  const formattedCharacters = characters.filter((character) => {
    if (answers.find((guess) => guess === character.name)) {
      return false
    }

    if (text) {
      return character.name.toLowerCase().startsWith(text.toLowerCase())
    }

    return true
  })

  useEffect(() => {
    if (answers.length === 0) return

    const answerIndex = answers.length - 1

    if (visibleIndexes[answerIndex] === properties.length) return

    properties.forEach((_, propertyIndex) => {
      setTimeout(() => {
        setVisibleIndexes((prev) => {
          const updatedMatrix = [...prev]
          updatedMatrix[answerIndex] = (updatedMatrix[answerIndex] || 0) + 1
          return updatedMatrix
        })
      }, 500 * propertyIndex)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers])

  useEffect(() => {
    const lastAnswerDate = new Date(
      Number(localStorage.getItem("hiraishindle-last_answer_timestamp"))
    )

    const today = new Date()

    if (
      today.getDay() !== lastAnswerDate.getDay() ||
      today.getMonth() !== lastAnswerDate.getMonth()
    ) {
      localStorage.removeItem("hiraishindle-answers")
      localStorage.removeItem("hiraishindle-last_answer_timestamp")
      return
    }

    const answers = JSON.parse(
      localStorage.getItem("hiraishindle-answers") || "[]"
    ) as string[]

    if (answers.length) {
      setVisibleIndexes(answers.map(() => properties.length))
      answers.some((answer) => answer === CHOSEN.name) && setIsFinished(true)
      setAnswers(answers)
    }
  }, [])

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const input = (e.target as HTMLFormElement).elements[0] as HTMLInputElement

    if (!input.value) {
      return
    }

    if (formattedCharacters.length) {
      handleSubmitName(formattedCharacters[0].name)
    }
  }

  const handleSubmitName = async (name: string): Promise<void> => {
    if (answers.find((guess) => name === guess) || isFishined) {
      return
    }

    setText("")
    setIsSelectOpen(false)

    const newAnswers = [...answers, name]

    setAnswers(newAnswers)

    localStorage.setItem("hiraishindle-answers", JSON.stringify(newAnswers))
    localStorage.setItem(
      "hiraishindle-last_answer_timestamp",
      new Date().getTime().toString()
    )

    if (name === CHOSEN.name) {
      setIsFinished(true)
    }
  }

  const onInputChange = (value: string) => {
    if (text === "" && value.length === 1) {
      setIsSelectOpen(true)
    }

    if (text.length === 1 && value.length === 0) {
      setIsSelectOpen(false)
    }

    setText(value)
  }

  const checkAnswer = (value: PersonProperty, chosenValue: PersonProperty): string => {
    if (Array.isArray(value) && Array.isArray(chosenValue)) {
      if (
        value.length === chosenValue.length &&
        (value.every((itr) => chosenValue.includes(itr)) ||
          value.every((itr, i) => itr === chosenValue[i]))
      ) {
        return "correct"
      }

      if (value.some((itr) => chosenValue.includes(itr))) {
        return "semicorrect"
      }
    }

    if (value === chosenValue) {
      return "correct"
    }

    return "incorrect"
  }

  const formatProperty = (
    value: PersonProperty,
    chosenValue: PersonProperty
  ): string | number | React.JSX.Element => {
    if (Array.isArray(value)) {
      return <span className="text-xs">{value.join(", ")}</span>
    }

    if (typeof value === "number" && typeof chosenValue === "number") {
      return (
        <div className="flex gap-1 items-center">
          {value}
          {value !== chosenValue &&
            (value > chosenValue ? (
              <MdArrowDownward className="w-4 h-4" />
            ) : (
              <MdArrowUpward className="w-4 h-4" />
            ))}
        </div>
      )
    }

    if (typeof value === "boolean") {
      return value ? "Sim" : "Não"
    }

    return value
  }

  return (
    <main className="my-2 flex w-full sm:max-w-[400px] justify-center mx-auto items-center flex-col font-medium px-3 pb-6">
      <form onSubmit={handleSubmitForm} className="mb-6 gap-2 relative w-full m-auto">
        <span className="text-center text-lg mb-2 block">Adivinhe o Hokage de hoje!</span>
        <div className="flex gap-3">
          <Input
            className="hover:bg-gray-800 transition-colors"
            onClick={(e) => e.currentTarget.value && setIsSelectOpen(true)}
            disabled={isFishined}
            value={text}
            onChange={(e) => onInputChange(e.target.value)}
          />
          <button type="submit">
            <MdSend className="w-5 h-5" />
          </button>
        </div>
        {formattedCharacters.length !== 0 && (
          <div
            ref={selectRef}
            className={cn(
              "w-full border top-[88px] left-0 h-[400px] ",
              isSelectOpen ? "absolute z-50" : "hidden"
            )}
          >
            <ScrollArea className="h-[inherit] bg-gray-800">
              <div className="h-0.5 w-full bg-ring" />
              <div className="divide-y divide-gray-700">
                {formattedCharacters.map((character) => (
                  <div
                    onSelect={() => console.log(character)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-700 transition-all duration-75"
                    key={character.name}
                    onClick={() => handleSubmitName(character.name)}
                  >
                    {character.name}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </form>
      {answers.length !== 0 && (
        <div className="text-sm w-[100%] sm:w-[160%] sm:-mx-[30%] overflow-x-auto overflow-y-hidden">
          <div className="w-[160%] sm:w-[unset] flex gap-2 text-center">
            {properties.map((property) => (
              <div
                className="flex basis-[calc(16.6%-4px)] w-0 items-center justify-center hover:border-ring transition-colors border-b-4 p-2"
                key={property}
              >
                <span>{property}</span>
              </div>
            ))}
          </div>
          <div className="w-[160%] sm:w-[unset] mt-2 flex flex-col-reverse gap-2 text-center">
            {answers.map((guess, row) => {
              const properties = Object.values(
                characters.find((character) => character.name === guess)!
              )

              return (
                <div className="flex gap-2" key={guess}>
                  {properties.map((value, column) => {
                    const chosenCharacterValues = Object.values(chosenCharacter)
                    const isVisible = visibleIndexes[row] > column

                    return (
                      <div
                        className={cn(
                          "opacity-0 transition-opacity duration-500",
                          isVisible && "opacity-100",
                          column === 0 && "bg-gray-200 text-black",
                          "px-0.5 basis-[calc(16.6%-4px)] aspect-[0.95] w-0 flex items-center justify-center font-semibold py-4 rounded-lg border-4-black data-[answer=incorrect]:bg-red-700 hover:data-[answer=incorrect]:bg-red-600 data-[answer=correct]:bg-green-700 hover:data-[answer=correct]:bg-green-600 data-[answer=semicorrect]:bg-yellow-700 hover:data-[answer=semicorrect]:bg-yellow-600"
                        )}
                        data-answer={
                          column !== 0 &&
                          checkAnswer(value, chosenCharacterValues[column])
                        }
                        key={value.toString()}
                      >
                        {formatProperty(value, chosenCharacterValues[column])}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
          {visibleIndexes[visibleIndexes.length - 1] === properties.length &&
            isFishined && (
              <span id="gg" className="mt-6 block text-center text-4xl">
                GG!
              </span>
            )}
        </div>
      )}
    </main>
  )
}
