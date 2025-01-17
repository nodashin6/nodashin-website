# ╔════════════════════════════════════════════════════════════════════════════════════╗
# ║  Main                                                                              ║
# ╚════════════════════════════════════════════════════════════════════════════════════╝
from dataclasses import dataclass
from typing import Callable


@dataclass
class Mochi:
    size: int

    def __lt__(self, other: "Mochi") -> bool:
        return self.size < other.size

    def __le__(self, other: "Mochi") -> bool:
        return self.size <= other.size

    def __eq__(self, other: "Mochi") -> bool:
        return self.size == other.size


@dataclass
class KagamiMochi:
    top: Mochi
    bottom: Mochi


class KagamiMochiInvalidError(Exception):

    def __init__(self, message: str) -> None:
        super().__init__(message)


class KagamiMochiGenerator:

    def __call__(self, top: Mochi, bottom: Mochi) -> KagamiMochi:
        if not self.validate(top, bottom):
            raise KagamiMochiInvalidError("Invalid KagamiMochi")
        return KagamiMochi(top, bottom)

    def validate(self, top: Mochi, bottom: Mochi) -> bool:
        return top.size <= (bottom.size >> 1)


@dataclass
class RawData:
    N: int
    A: list[int]


@dataclass
class MochiData:
    n: int
    mochis: list[Mochi]


@dataclass
class SortedMochiList:
    n: int
    mochis: list[Mochi]

    def __post_init__(self):
        for a, b in zip(self.mochis[:-1], self.mochis[1:]):
            assert a <= b

    def __getitem__(self, index: int) -> Mochi:
        return self.mochis[index]

    def __len__(self) -> int:
        return self.n

    def __iter__(self):
        return iter(self.mochis)


def preprocess(data: RawData) -> SortedMochiList:
    mochis = [Mochi(size) for size in data.A]
    return SortedMochiList(data.N, mochis=sorted(mochis))


class Solver:
    def __init__(self, kagamimochi_generator: Callable[[Mochi, Mochi], KagamiMochi]):
        self.kagamimochi_generator = kagamimochi_generator

    def read_raw_data(self) -> RawData:
        N = int(input())
        A = list(map(int, input().split()))
        return RawData(N, A)

    def preprocess(self, data: RawData) -> SortedMochiList:
        return preprocess(data)

    def is_valid_kagamimochi(self, top: Mochi, bottom: Mochi) -> bool:
        try:
            self.kagamimochi_generator(top, bottom)
            return True
        except KagamiMochiInvalidError:
            return False

    def solve(self) -> int:
        i = 0
        ans = 0
        for mochi in self.mochis:
            while i < len(self.mochis) and not self.is_valid_kagamimochi(
                mochi, self.mochis[i]
            ):
                i += 1
            ans += len(self.mochis) - i
        return ans

    def __call__(self):
        data = self.read_raw_data()
        self.mochis = self.preprocess(data)
        return self.solve()


def main():
    solver = Solver(KagamiMochiGenerator())
    print(solver())


# ╔════════════════════════════════════════════════════════════════════════════════════╗
# ║  Libraries                                                                         ║
# ║    See Also : https://github.com/nodashin6/atcoder                                 ║
# ╚════════════════════════════════════════════════════════════════════════════════════╝


# ╔════════════════════════════════════════════════════════════════════════════════════╗
# ║  Helper Functions                                                                  ║
# ╚════════════════════════════════════════════════════════════════════════════════════╝


import sys


def input() -> str:
    return sys.stdin.readline().rstrip()


# ╔════════════════════════════════════════════════════════════════════════════════════╗
# ║  Entry Point                                                                       ║
# ╚════════════════════════════════════════════════════════════════════════════════════╝


if __name__ == "__main__":
    main()
