setwd('C:/Users/dahenn07/Dropbox/datablog/refugees')

require(dplyr)
require(tidyr)
require(ggplot2)
require(Spark)
options(scipen=999)

format_14_15 <- function(x) {
    x <- select(x, origin = Origin, residence = Residence, pop_type, X2014 = as.integer(X2.014), X2015 = as.integer(X2.015))
    x
}

refugees <- format_14_15(read.csv('data/14_15_refugees.csv'))
idp <- format_14_15(read.csv('data/14_15_idp.csv'))
ooc <- format_14_15(read.csv('data/14_15_ooc.csv'))
stateless <- format_14_15(read.csv('data/14_15_stateless.csv'))

dat <- read.csv('data/psq-tms.csv') %>% rename(origin = Origin, residence = Residence)
dat_14_15 <- rbind(rbind(rbind(refugees, idp),ooc),stateless)

dat_14_15$origin <- gsub('[[:digit:]]+', '', dat_14_15$origin)
dat_14_15$residence <- gsub('[[:digit:]]+', '', dat_14_15$residence)

data <- full_join(dat, dat_14_15, by=c('origin','residence','pop_type'))
data <- data %>% filter(pop_type!='Asylum seekers') %>% filter(pop_type!='Returned refugees') %>% filter(pop_type!='Returned IDPs')
data_long <- data %>% gather(year, population, X2000:X2015)
data_long$year <- gsub('[^0-9]', '', data_long$year)
data_long <- data_long %>% filter(!is.na(population))
year_total <- data_long %>% group_by(year,pop_type) %>% summarize(population = sum(population))
ggplot(year_total, aes(x=year, y=population, color=pop_type)) + geom_point()

# data_parsed <- data_long %>% filter(population > 1000)
# other <- data_long %>% filter(population <= 1000) %>% group_by(year, pop_type) %>% summarize(population=sum(population))
# other$origin <- 'Other'
# other$residence <- 'Other'
# data_parsed <- bind_rows(data_parsed, other)

# origin <- data_parsed %>% group_by(origin, pop_type, year) %>% summarize(population=sum(population))

filled <- data
filled[is.na(filled)] <- 0
origin <- filled %>% select(-residence) %>% group_by(origin, pop_type) %>% summarise_each(funs(sum))
origin$id <- seq_len(nrow(origin))
max(select(ungroup(origin),X2000:X2015))

write.csv(origin, file = 'data/origin.csv', row.names = FALSE, na = '0')

yr_totals <- year_total %>% group_by(year) %>% summarise(pop = sum(population))
write.csv(yr_totals, file = 'data/origin_totals.csv', row.names = FALSE, na = '0')

residence <- filled %>% filter(pop_type=='Refugees') %>% select(-origin) %>% group_by(residence, pop_type) %>% summarise_each(funs(sum))
residence$id <- seq_len(nrow(residence))
write.csv(residence, file = 'data/residence.csv', row.names = FALSE, na = '0')

residence_totals <- year_total %>% filter(pop_type=='Refugees') %>% group_by(year) %>% summarise(pop = sum(population))
write.csv(residence_totals, file = 'data/residence_totals.csv', row.names = FALSE, na = '0')

gdp_pop <- read.csv('data/gdp_pop_2015.csv') %>% rename(residence = country)
res15 <- merge(residence %>% select(residence, refugees = X2015) %>% arrange(-refugees),gdp_pop, by = 'residence', all.x = T)
res15$id <- seq_len(nrow(res15))         
res15$gdppop <- with(res15, gdp/population)
res15$gdp <- res15$gdp/1000000000
res15 <- res15 %>% filter(!is.na(gdp))
res15 <- res15 %>% filter(!is.na(landarea))
res15 <- res15 %>% filter(!is.na(unemployment))
res15 <- res15 %>% filter(population>300000)
res15$category <- 'Other Country'
res15$category[res15$cat==1] <- 'OECD Country'
res15$category[res15$cat==2] <- 'Middle Eastern Country'
write.csv(res15, file = 'data/res15.csv', row.names = FALSE, na = '0')
