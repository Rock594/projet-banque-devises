-- Création de la base de données
CREATE DATABASE banque_devises
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'fr_FR.UTF-8'
    LC_CTYPE = 'fr_FR.UTF-8'
    TEMPLATE = template0;

\c banque_devises;

-- Création des extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Création des schémas
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS archive;

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Index pour la recherche full-text
CREATE OR REPLACE FUNCTION make_tsvector(text, text)
RETURNS tsvector AS $$
BEGIN
    RETURN (setweight(to_tsvector('french', COALESCE($1,'')), 'A') ||
            setweight(to_tsvector('french', COALESCE($2,'')), 'B'));
END
$$ LANGUAGE 'plpgsql' IMMUTABLE;

-- Vue pour les statistiques quotidiennes
CREATE OR REPLACE VIEW daily_statistics AS
SELECT 
    DATE(transaction_date) as date,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_transactions,
    SUM(amount_from) as total_volume,
    AVG(rate_applied) as avg_rate
FROM transactions_transaction
GROUP BY DATE(transaction_date)
ORDER BY date DESC;

-- Vue pour les alertes automatiques
CREATE OR REPLACE VIEW rate_alerts_view AS
SELECT 
    CONCAT(c1.code, '/', c2.code) as pair,
    er.buy_rate,
    er.sell_rate,
    er.mid_rate,
    (er.buy_rate - er.sell_rate) / er.mid_rate * 100 as spread_percentage,
    CASE 
        WHEN (er.buy_rate - er.sell_rate) / er.mid_rate * 100 > 2 THEN 'HIGH_SPREAD'
        WHEN er.buy_rate / LAG(er.buy_rate) OVER (PARTITION BY er.from_currency, er.to_currency ORDER BY er.valid_from) > 1.05 THEN 'VOLATILITY'
        ELSE 'NORMAL'
    END as alert_type
FROM currencies_exchangerate er
JOIN currencies_currency c1 ON er.from_currency_id = c1.id
JOIN currencies_currency c2 ON er.to_currency_id = c2.id
WHERE er.valid_to IS NULL;

-- Fonction pour archiver les anciennes transactions
CREATE OR REPLACE FUNCTION archive_old_transactions(months integer)
RETURNS integer AS $$
DECLARE
    archived_count integer;
BEGIN
    INSERT INTO archive.transactions
    SELECT * FROM transactions_transaction
    WHERE transaction_date < CURRENT_DATE - (months || ' months')::interval
    AND status = 'COMPLETED';
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    DELETE FROM transactions_transaction
    WHERE transaction_date < CURRENT_DATE - (months || ' months')::interval
    AND status = 'COMPLETED';
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;