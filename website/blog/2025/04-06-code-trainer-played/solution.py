import heapq

N = 1024


class Solution:
    def add_spaces(self, text: str, words: list[str]) -> str:
        wc = WordCollection()
        for word in words:
            wc.add(word)

        n = len(text)
        graph = [set() for _ in range(n + 1)]
        for i in range(n):
            for j in range(i + 1, n + 1):
                m = j - i - 1
                s = text[i:j]
                if s in wc:
                    graph[i].add(j)
        seen = [-1] * (n + 1)
        seen[0] = 0
        hq = [0]
        while hq:
            i = heapq.heappop(hq)
            for j in graph[i]:
                if seen[j] != -1:
                    continue
                seen[j] = i
                heapq.heappush(hq, j)
        if seen[n] == -1:
            ans = text
        else:
            ans_list = []
            j = n
            while 0 < j:
                i = seen[j]
                ans_list.append(text[i:j])
                j = i
            ans = " ".join(ans_list[::-1])
        return ans


class WordCollection:

    def __init__(self):
        self.a = [set() for _ in range(N)]

    def add(self, word: str) -> None:
        i = len(word) - 1
        self.a[i].add(hash(word))

    def __contains__(self, word: str) -> bool:
        i = len(word) - 1
        h = hash(word)
        return h in self.a[i]
