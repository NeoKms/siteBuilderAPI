-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Фев 28 2021 г., 19:07
-- Версия сервера: 5.7.24-log
-- Версия PHP: 7.2.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `sitebuilder`
--

-- --------------------------------------------------------

--
-- Структура таблицы `sites`
--

CREATE TABLE `sites` (
  `id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `name` text NOT NULL,
  `active` tinyint(4) NOT NULL,
  `address` text NOT NULL,
  `img` text NOT NULL,
  `description` text NOT NULL,
  `template_id` int(11) NOT NULL,
  `contacts` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `sites`
--

INSERT INTO `sites` (`id`, `type_id`, `name`, `active`, `address`, `img`, `description`, `template_id`, `contacts`) VALUES
(1, 1, 'site1', 1, 'vlad.dev.lan', 'https://www.vkpress.ru/upload/iblock/56b/56b5d2504d707f50989bc1677e0fce38.png', 'тест сайт 1', 1, '{\"title\":\"названиеорг\",\"phone\":\"телорг\",\"city\":\"город\",\"street\":\"улиц\",\"house\":\"1\",\"litera\":\"2\",\"index\":333444,\"emailMain\":\"tmp1@gmila.com\",\"emailFeedback\":\"tmp2@gmail.com\",\"doubleMailing\":\"1\",\"coordinate\":{\"x\":\"59.9558742615268\",\"y\":\"30.369708388251336\"}}'),
(2, 2, 'site2', 0, 'vlad2.dev.lan', 'https://99px.ru/sstorage/56/2019/07/image_562207191850033055418.jpg', 'тест сайт 2', 0, '{\"title\":\"названиеорг1\",\"phone\":\"телорг1\",\"city\":\"город1\",\"street\":\"улиц1\",\"house\":\"2\",\"litera\":\"3\",\"index\":111111,\"emailMain\":\"tmp1@gmila.com1\",\"emailFeedback\":\"tmp2@gmail.com1\",\"doubleMailing\":\"0\",\"coordinate\":{\"x\":\"59.9558742615268\",\"y\":\"30.369708388251336\"}}');

-- --------------------------------------------------------

--
-- Структура таблицы `site_types`
--

CREATE TABLE `site_types` (
  `id` int(11) NOT NULL,
  `name` text NOT NULL,
  `code` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `site_types`
--

INSERT INTO `site_types` (`id`, `name`, `code`) VALUES
(1, 'Сайт', 'site'),
(2, 'Лендинг', 'landing'),
(3, 'Промо-сайт', 'promoSite');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `login` text NOT NULL,
  `password` text NOT NULL,
  `fio` text NOT NULL,
  `rights` text NOT NULL,
  `email` text NOT NULL,
  `phone` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `login`, `password`, `fio`, `rights`, `email`, `phone`) VALUES
(1, 'root', '66c6aa10391319a0799d2ff4ab7502a9', 'admin', '{\"sites\":2,\"users\":2}', '', '');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type_id` (`type_id`);

--
-- Индексы таблицы `site_types`
--
ALTER TABLE `site_types`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `site_types`
--
ALTER TABLE `site_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `sites`
--
ALTER TABLE `sites`
  ADD CONSTRAINT `sites_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `site_types` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
