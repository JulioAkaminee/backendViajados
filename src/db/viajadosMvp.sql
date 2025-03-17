-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 14/03/2025 às 15:03
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `viajados`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `favoritos_hoteis`
--

CREATE TABLE `favoritos_hoteis` (
  `idFavoritoHotel` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idHoteis` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Despejando dados para a tabela `favoritos_hoteis`
--

INSERT INTO `favoritos_hoteis` (`idFavoritoHotel`, `idUsuario`, `idHoteis`) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3);

-- --------------------------------------------------------

--
-- Estrutura para tabela `favoritos_voos`
--

CREATE TABLE `favoritos_voos` (
  `idFavoritoVoo` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idVoos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Despejando dados para a tabela `favoritos_voos`
--

INSERT INTO `favoritos_voos` (`idFavoritoVoo`, `idUsuario`, `idVoos`) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3);

-- --------------------------------------------------------

--
-- Estrutura para tabela `hospedagem`
--

CREATE TABLE `hospedagem` (
  `idHospedagem` int(11) NOT NULL,
  `localizacao_hotel` varchar(255) NOT NULL,
  `idHoteis` int(11) NOT NULL,
  `data_entrada` date NOT NULL,
  `data_saida` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Despejando dados para a tabela `hospedagem`
--

INSERT INTO `hospedagem` (`idHospedagem`, `localizacao_hotel`, `idHoteis`, `data_entrada`, `data_saida`) VALUES
(1, 'Praia de Copacabana, RJ', 1, '2025-04-10', '2025-04-15'),
(2, 'Centro Histórico, Salvador', 2, '2025-04-12', '2025-04-18'),
(3, 'Serra Gaúcha, RS', 3, '2025-04-20', '2025-04-25');

-- --------------------------------------------------------

--
-- Estrutura para tabela `hoteis`
--

CREATE TABLE `hoteis` (
  `idHoteis` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `preco_diaria` decimal(10,0) DEFAULT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `avaliacao` int(11) DEFAULT NULL CHECK (`avaliacao` between 0 and 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Despejando dados para a tabela `hoteis`
--

INSERT INTO `hoteis` (`idHoteis`, `nome`, `preco_diaria`, `descricao`, `avaliacao`) VALUES
(1, 'Hotel Paraíso', 250, 'Hotel de luxo com vista para o mar', 4),
(2, 'Pousada do Sol', 150, 'Aconchegante pousada no centro', 3),
(3, 'Resort das Águas', 450, 'Resort com piscinas termais', 5);

-- --------------------------------------------------------

--
-- Estrutura para tabela `reserva_voo`
--

CREATE TABLE `reserva_voo` (
  `idReserva` int(11) NOT NULL,
  `idVoos` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `data_reserva` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Despejando dados para a tabela `reserva_voo`
--

INSERT INTO `reserva_voo` (`idReserva`, `idVoos`, `idUsuario`, `data_reserva`) VALUES
(1, 1, 1, '2025-03-15 10:00:00'),
(2, 2, 2, '2025-03-16 14:00:00'),
(3, 3, 3, '2025-03-17 09:30:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
--

CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `cpf` varchar(11) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `nacionalidade` varchar(255) DEFAULT NULL,
  `sexo` enum('M','F') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Despejando dados para a tabela `usuario`
--

INSERT INTO `usuario` (`idUsuario`, `email`, `senha`, `nome`, `ativo`, `cpf`, `data_nascimento`, `nacionalidade`, `sexo`) VALUES
(1, 'joao.silva@email.com', 'senha123', 'João Silva', 1, '12345678901', '1990-05-15', 'Brasileiro', 'M'),
(2, 'maria.oliveira@email.com', 'abc456', 'Maria Oliveira', 1, '98765432109', '1985-08-22', 'Brasileira', 'F'),
(3, 'pedro.santos@email.com', 'xyz789', 'Pedro Santos', 1, '45678912345', '1995-03-10', 'Brasileiro', 'M');

-- --------------------------------------------------------

--
-- Estrutura para tabela `voos`
--

CREATE TABLE `voos` (
  `idVoos` int(11) NOT NULL,
  `destino` varchar(255) NOT NULL,
  `preco` decimal(10,0) NOT NULL,
  `origem` varchar(255) NOT NULL,
  `data` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Despejando dados para a tabela `voos`
--

INSERT INTO `voos` (`idVoos`, `destino`, `preco`, `origem`, `data`) VALUES
(1, 'São Paulo', 300, 'Rio de Janeiro', '2025-04-01 08:00:00'),
(2, 'Salvador', 450, 'São Paulo', '2025-04-02 14:30:00'),
(3, 'Porto Alegre', 280, 'Curitiba', '2025-04-03 10:15:00');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `favoritos_hoteis`
--
ALTER TABLE `favoritos_hoteis`
  ADD PRIMARY KEY (`idFavoritoHotel`),
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `idHoteis` (`idHoteis`);

--
-- Índices de tabela `favoritos_voos`
--
ALTER TABLE `favoritos_voos`
  ADD PRIMARY KEY (`idFavoritoVoo`),
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `idVoos` (`idVoos`);

--
-- Índices de tabela `hospedagem`
--
ALTER TABLE `hospedagem`
  ADD PRIMARY KEY (`idHospedagem`),
  ADD KEY `hospedagem_index_0` (`idHoteis`);

--
-- Índices de tabela `hoteis`
--
ALTER TABLE `hoteis`
  ADD PRIMARY KEY (`idHoteis`);

--
-- Índices de tabela `reserva_voo`
--
ALTER TABLE `reserva_voo`
  ADD PRIMARY KEY (`idReserva`),
  ADD KEY `reserva_voo_index_0` (`idVoos`,`idUsuario`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Índices de tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cpf` (`cpf`);

--
-- Índices de tabela `voos`
--
ALTER TABLE `voos`
  ADD PRIMARY KEY (`idVoos`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `favoritos_hoteis`
--
ALTER TABLE `favoritos_hoteis`
  MODIFY `idFavoritoHotel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `favoritos_voos`
--
ALTER TABLE `favoritos_voos`
  MODIFY `idFavoritoVoo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `hospedagem`
--
ALTER TABLE `hospedagem`
  MODIFY `idHospedagem` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `hoteis`
--
ALTER TABLE `hoteis`
  MODIFY `idHoteis` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `reserva_voo`
--
ALTER TABLE `reserva_voo`
  MODIFY `idReserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `voos`
--
ALTER TABLE `voos`
  MODIFY `idVoos` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `favoritos_hoteis`
--
ALTER TABLE `favoritos_hoteis`
  ADD CONSTRAINT `favoritos_hoteis_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `favoritos_hoteis_ibfk_2` FOREIGN KEY (`idHoteis`) REFERENCES `hoteis` (`idHoteis`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Restrições para tabelas `favoritos_voos`
--
ALTER TABLE `favoritos_voos`
  ADD CONSTRAINT `favoritos_voos_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `favoritos_voos_ibfk_2` FOREIGN KEY (`idVoos`) REFERENCES `voos` (`idVoos`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Restrições para tabelas `hospedagem`
--
ALTER TABLE `hospedagem`
  ADD CONSTRAINT `hospedagem_ibfk_1` FOREIGN KEY (`idHoteis`) REFERENCES `hoteis` (`idHoteis`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Restrições para tabelas `reserva_voo`
--
ALTER TABLE `reserva_voo`
  ADD CONSTRAINT `reserva_voo_ibfk_1` FOREIGN KEY (`idVoos`) REFERENCES `voos` (`idVoos`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `reserva_voo_ibfk_2` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
