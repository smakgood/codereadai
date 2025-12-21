-- Скрипт для заполнения таблицы tasks
-- Использование: mysql -u codereadai_user -p codereadai < insert_tasks.sql

USE codereadai;

-- ВАЖНО: Убедитесь, что языки уже добавлены в таблицу languages
-- Python должен иметь id = 1 (если вставлялся первым)

-- ============================================
-- ЛЕГКИЕ ЗАДАЧИ (easy)
-- ============================================

INSERT INTO `tasks` (`language_id`, `title`, `description`, `code_snippet`, `difficulty`, `reference_explanation`, `is_published`) VALUES
(1, 'Простая функция сложения', 
'Проанализируйте эту простую функцию Python',
'def add_numbers(a, b):
    """Складывает два числа"""
    result = a + b
    return result

print(add_numbers(5, 3))',
'easy',
'Эта функция принимает два параметра a и b, складывает их и возвращает результат. Функция использует оператор + для сложения чисел. В конце вызывается функция с аргументами 5 и 3, что выведет 8.',
1),

(1, 'Проверка четности числа',
'Что делает эта функция?',
'def is_even(number):
    if number % 2 == 0:
        return True
    else:
        return False

print(is_even(4))
print(is_even(7))',
'easy',
'Функция проверяет, является ли число четным. Использует оператор остатка от деления (%). Если остаток от деления на 2 равен 0, число четное - возвращает True. Иначе возвращает False. Для 4 вернет True, для 7 - False.',
1),

(1, 'Нахождение максимума',
'Определите логику работы функции',
'def find_max(numbers):
    max_value = numbers[0]
    for num in numbers:
        if num > max_value:
            max_value = num
    return max_value

result = find_max([3, 7, 2, 9, 1])
print(result)',
'easy',
'Функция находит максимальное значение в списке чисел. Инициализирует max_value первым элементом списка, затем проходит по всем элементам. Если текущий элемент больше max_value, обновляет его. Возвращает максимальное значение. Для списка [3, 7, 2, 9, 1] вернет 9.',
1),

-- ============================================
-- СРЕДНИЕ ЗАДАЧИ (medium)
-- ============================================

(1, 'Подсчет слов в строке',
'Проанализируйте алгоритм подсчета слов',
'def count_words(text):
    words = text.split()
    word_count = {}
    for word in words:
        word = word.lower().strip(".,!?")
        if word in word_count:
            word_count[word] += 1
        else:
            word_count[word] = 1
    return word_count

result = count_words("Hello world hello Python")
print(result)',
'medium',
'Функция подсчитывает частоту каждого слова в тексте. Разбивает текст на слова методом split(), создает словарь для подсчета. Приводит слова к нижнему регистру и удаляет знаки препинания. Увеличивает счетчик для каждого слова. Возвращает словарь с частотой слов. Результат: {"hello": 2, "world": 1, "python": 1}.',
1),

(1, 'Фильтрация списка по условию',
'Что делает этот код?',
'def filter_positive(numbers):
    return [x for x in numbers if x > 0]

def filter_custom(numbers, condition):
    result = []
    for num in numbers:
        if condition(num):
            result.append(num)
    return result

numbers = [-2, 5, -1, 0, 8, -3]
positive = filter_positive(numbers)
even = filter_custom(numbers, lambda x: x % 2 == 0)
print(positive)
print(even)',
'medium',
'Первая функция использует list comprehension для фильтрации положительных чисел. Вторая функция - более универсальная, принимает условие как lambda-функцию. Проходит по списку и добавляет элементы, удовлетворяющие условию. Для numbers = [-2, 5, -1, 0, 8, -3]: positive = [5, 8], even = [-2, 0, 8].',
1),

(1, 'Обработка словаря с вложенными структурами',
'Проанализируйте работу с вложенными данными',
'def get_nested_value(data, keys):
    current = data
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return None
    return current

data = {
    "user": {
        "profile": {
            "name": "John",
            "age": 30
        }
    }
}

name = get_nested_value(data, ["user", "profile", "name"])
age = get_nested_value(data, ["user", "profile", "age"])
invalid = get_nested_value(data, ["user", "email"])
print(name, age, invalid)',
'medium',
'Функция безопасно извлекает значение из вложенного словаря по цепочке ключей. Проходит по каждому ключу, проверяя что текущий элемент - словарь и содержит нужный ключ. Если ключ не найден, возвращает None. Это защищает от ошибок KeyError. Результат: name="John", age=30, invalid=None.',
1),

-- ============================================
-- СЛОЖНЫЕ ЗАДАЧИ (hard)
-- ============================================

(1, 'Рекурсивный обход дерева',
'Разберитесь в рекурсивном алгоритме',
'class TreeNode:
    def __init__(self, value):
        self.value = value
        self.children = []
    
    def add_child(self, node):
        self.children.append(node)

def traverse_tree(node, depth=0):
    result = []
    indent = "  " * depth
    result.append(f"{indent}{node.value}")
    for child in node.children:
        result.extend(traverse_tree(child, depth + 1))
    return result

root = TreeNode("A")
b = TreeNode("B")
c = TreeNode("C")
d = TreeNode("D")
root.add_child(b)
root.add_child(c)
b.add_child(d)

output = traverse_tree(root)
print("\\n".join(output))',
'hard',
'Код реализует структуру дерева с помощью класса TreeNode. Каждый узел содержит значение и список дочерних узлов. Функция traverse_tree рекурсивно обходит дерево в глубину, собирая значения с отступами для визуализации иерархии. Рекурсия продолжается для каждого дочернего узла с увеличением глубины. Результат: A, затем B с отступом, затем D с двойным отступом, затем C с отступом.',
1),

(1, 'Мемоизация и декораторы',
'Объясните работу декоратора мемоизации',
'def memoize(func):
    cache = {}
    def wrapper(*args):
        if args in cache:
            return cache[args]
        result = func(*args)
        cache[args] = result
        return result
    return wrapper

@memoize
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))',
'hard',
'Декоратор memoize реализует кэширование результатов функции. Создает словарь cache для хранения вычисленных значений. При вызове функции проверяет, есть ли результат для данных аргументов в кэше. Если есть - возвращает из кэша, иначе вычисляет, сохраняет в кэш и возвращает. Применяется к рекурсивной функции fibonacci для оптимизации - без мемоизации вычисления повторяются многократно. С мемоизацией каждое значение вычисляется один раз.',
1),

(1, 'Обработка исключений и контекстные менеджеры',
'Проанализируйте обработку ошибок',
'class FileHandler:
    def __init__(self, filename):
        self.filename = filename
        self.file = None
    
    def __enter__(self):
        try:
            self.file = open(self.filename, "r")
            return self.file
        except FileNotFoundError:
            print(f"File {self.filename} not found")
            raise
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
        return False

try:
    with FileHandler("data.txt") as f:
        content = f.read()
        print(f"Read {len(content)} characters")
except FileNotFoundError:
    print("Handling file error")',
'hard',
'Класс FileHandler реализует протокол контекстного менеджера через методы __enter__ и __exit__. __enter__ открывает файл и обрабатывает FileNotFoundError. __exit__ гарантированно закрывает файл даже при ошибках. Конструкция with автоматически вызывает эти методы. Если файл не найден, исключение пробрасывается дальше (return False), и обрабатывается внешним try-except. Это обеспечивает безопасную работу с ресурсами.',
1),

-- ============================================
-- ЭКСПЕРТНЫЕ ЗАДАЧИ (expert)
-- ============================================

(1, 'Генераторы и ленивые вычисления',
'Объясните работу генераторов',
'def prime_generator(limit):
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n ** 0.5) + 1):
            if n % i == 0:
                return False
        return True
    
    num = 2
    count = 0
    while count < limit:
        if is_prime(num):
            yield num
            count += 1
        num += 1

primes = prime_generator(10)
print(list(primes))

# Ленивое вычисление
infinite_primes = prime_generator(float("inf"))
first_five = [next(infinite_primes) for _ in range(5)]
print(first_five)',
'expert',
'Код реализует генератор простых чисел. Внутренняя функция is_prime проверяет простоту числа методом перебора делителей до квадратного корня. Генератор использует yield для ленивого вычисления - числа генерируются по требованию, а не все сразу. Это экономит память. Второй пример демонстрирует работу с "бесконечным" генератором - next() получает следующее значение по требованию. Генераторы позволяют работать с большими последовательностями без загрузки всех данных в память.',
1),

(1, 'Метапрограммирование и дескрипторы',
'Разберитесь в продвинутых возможностях Python',
'class ValidatedProperty:
    def __init__(self, validator):
        self.validator = validator
        self.name = None
    
    def __set_name__(self, owner, name):
        self.name = f"_{name}"
    
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.name, None)
    
    def __set__(self, obj, value):
        if not self.validator(value):
            raise ValueError(f"Invalid value: {value}")
        setattr(obj, self.name, value)

def positive_number(value):
    return isinstance(value, (int, float)) and value > 0

class Product:
    price = ValidatedProperty(positive_number)
    quantity = ValidatedProperty(positive_number)
    
    def __init__(self, price, quantity):
        self.price = price
        self.quantity = quantity

try:
    p = Product(100, 5)
    print(f"Price: {p.price}, Quantity: {p.quantity}")
    p.price = -50  # Ошибка!
except ValueError as e:
    print(e)',
'expert',
'Код демонстрирует дескриптор протокола - класс ValidatedProperty. Дескриптор перехватывает доступ к атрибутам через __get__ и __set__. __set_name__ автоматически вызывается при создании класса для установки имени атрибута. Валидация происходит в __set__ перед установкой значения. Значения хранятся с префиксом подчеркивания для избежания рекурсии. Класс Product использует дескриптор для автоматической валидации - попытка установить отрицательное значение вызывает ValueError. Это пример метапрограммирования - код управляет поведением атрибутов на уровне класса.',
1);

-- Проверка вставленных данных
SELECT 
    t.id,
    l.name as language,
    t.title,
    t.difficulty,
    t.is_published,
    LENGTH(t.code_snippet) as code_length,
    LENGTH(t.reference_explanation) as explanation_length
FROM tasks t
JOIN languages l ON t.language_id = l.id
ORDER BY t.difficulty, t.id;

